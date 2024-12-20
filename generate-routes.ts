import { readFile, writeFile } from 'node:fs/promises'
import { dirname, posix, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { openapi } from '@seamapi/types/connect'
import { camelCase, kebabCase, pascalCase, snakeCase } from 'change-case'
import { deleteAsync } from 'del'
import { ESLint } from 'eslint'
import { format, resolveConfig } from 'prettier'

const rootPathParts = ['src', 'lib', 'seam', 'connect']

const routeOutputPathParts = ['routes']

const rootPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  ...rootPathParts,
)
const rootClassPath = resolve(rootPath, 'seam-http.ts')
const routeOutputPath = resolve(rootPath, ...routeOutputPathParts)

async function main(): Promise<void> {
  const routes = createRoutes()
  const routeNames = await Promise.all(routes.map(writeRoute))
  const routeIndexName = await writeRoutesIndex(routes)
  const outputPathParts = [...rootPathParts, ...routeOutputPathParts]
  await deleteAsync([
    posix.join(...outputPathParts, '*'),
    `!${posix.join(...outputPathParts, routeIndexName)}`,
    ...routeNames.map((name) => `!${posix.join(...outputPathParts, name)}`),
  ])
}

const openapiResponseKeyProp = 'x-fern-sdk-return-value'

const routePaths = [
  '/access_codes',
  '/access_codes/simulate',
  '/access_codes/unmanaged',
  '/acs',
  '/acs/access_groups',
  '/acs/credential_pools',
  '/acs/credential_provisioning_automations',
  '/acs/credentials',
  '/acs/entrances',
  '/acs/systems',
  '/acs/users',
  '/acs/users/unmanaged',
  '/acs/access_groups/unmanaged',
  '/acs/credentials/unmanaged',
  '/acs/encoders',
  '/acs/encoders/simulate',
  '/action_attempts',
  '/client_sessions',
  '/connect_webviews',
  '/connected_accounts',
  '/devices',
  '/devices/unmanaged',
  '/devices/simulate',
  '/events',
  '/locks',
  '/networks',
  '/noise_sensors',
  '/noise_sensors/noise_thresholds',
  '/noise_sensors/simulate',
  '/phones',
  '/phones/simulate',
  '/thermostats',
  '/thermostats/schedules',
  '/user_identities',
  '/user_identities/enrollment_automations',
  '/webhooks',
  '/workspaces',
] as const

const routePathSubresources: Partial<
  Record<(typeof routePaths)[number], string[]>
> = {
  '/access_codes': ['unmanaged', 'simulate'],
  '/acs': [
    'access_groups',
    'credential_pools',
    'credential_provisioning_automations',
    'credentials',
    'entrances',
    'systems',
    'users',
  ],
  '/acs/users': ['unmanaged'],
  '/acs/access_groups': ['unmanaged'],
  '/acs/credentials': ['unmanaged'],
  '/acs/encoders': ['simulate'],
  '/phones': ['simulate'],
  '/devices': ['unmanaged', 'simulate'],
  '/noise_sensors': ['noise_thresholds', 'simulate'],
  '/thermostats': ['schedules'],
  '/user_identities': ['enrollment_automations'],
}

interface Route {
  namespace: string
  endpoints: Endpoint[]
  subresources: string[]
}

interface Endpoint {
  name: string
  path: string
  namespace: string
  resource: string | null
  method: Method
  requestFormat: 'params' | 'body'
  isRequestParamOptional: boolean
}

type Method = 'GET' | 'POST'

interface ClassMeta {
  constructors: string
}

const createRoutes = (): Route[] => {
  const paths = Object.keys(openapi.paths)

  const unmatchedEndpointPaths = paths.filter(
    (path) =>
      !routePaths.some((routePath) => isEndpointUnderRoute(path, routePath)),
  )

  if (unmatchedEndpointPaths.length > 0) {
    throw new Error(
      `The following endpoints will not be generated (add them to routePaths in generate-routes.ts):\n\n${unmatchedEndpointPaths.join(
        '\n',
      )}\n`,
    )
  }

  return routePaths.map(createRoute)
}

const createRoute = (routePath: (typeof routePaths)[number]): Route => {
  const endpointPaths = Object.keys(openapi.paths).filter((path) =>
    isEndpointUnderRoute(path, routePath),
  )

  const namespace = routePath.split('/').join('_').slice(1)

  return {
    namespace,
    subresources: routePathSubresources[routePath] ?? [],
    endpoints: endpointPaths.map((endpointPath) =>
      createEndpoint(namespace, routePath, endpointPath),
    ),
  }
}

const createEndpoint = (
  namespace: string,
  routePath: string,
  endpointPath: string,
): Endpoint => {
  if (!isOpenapiPath(endpointPath)) {
    throw new Error(`Did not find ${endpointPath} in OpenAPI spec`)
  }
  const spec = openapi.paths[endpointPath]
  const method = deriveSemanticMethod(Object.keys(spec))
  const name = endpointPath.split(routePath)[1]?.slice(1)
  if (name == null) {
    throw new Error(`Could not parse name from ${endpointPath}`)
  }
  return {
    name,
    namespace,
    path: endpointPath,
    method,
    resource: deriveResource(endpointPath, method),
    requestFormat: ['GET', 'DELETE'].includes(method) ? 'params' : 'body',
    // UPSTREAM: This could be derived from the OpenAPI spec, however some endpoints require at least one param,
    // and in the spec this currently looks as if params are optional.
    isRequestParamOptional: true,
  }
}

const deriveResource = (
  endpointPath: string,
  method: Method,
): string | null => {
  if (isOpenapiPath(endpointPath)) {
    const spec = openapi.paths[endpointPath]
    const methodKey = method.toLowerCase()

    if (methodKey === 'post' && 'post' in spec) {
      const postSpec = spec.post
      const openapiEndpointResource =
        openapiResponseKeyProp in postSpec
          ? postSpec[openapiResponseKeyProp]
          : null

      return openapiEndpointResource
    }

    if (methodKey === 'get' && 'get' in spec) {
      const response = spec.get.responses[200]

      if (!('content' in response)) {
        throw new Error(`Missing resource for ${method} ${endpointPath}`)
      }

      return deriveResourceFromSchemaForGetRequest(
        response.content['application/json']?.schema?.properties ?? {},
      )
    }
  }

  throw new Error(`Could not derive resource for ${method} ${endpointPath}`)
}

const deriveResourceFromSchemaForGetRequest = (
  properties: object,
): string | null =>
  Object.keys(properties).filter((key) => key !== 'ok')[0] ?? null

const deriveSemanticMethod = (methods: string[]): Method => {
  // UPSTREAM: This should return GET before POST.
  // Blocked on https://github.com/seamapi/nextlove/issues/117
  // and https://github.com/seamapi/javascript-http/issues/43
  if (methods.includes('post')) return 'POST'
  if (methods.includes('get')) return 'GET'
  throw new Error(`Could not find valid method in ${methods.join(', ')}`)
}

const isOpenapiPath = (key: string): key is keyof typeof openapi.paths =>
  key in openapi.paths

const isEndpointUnderRoute = (
  endpointPath: string,
  routePath: string,
): boolean =>
  endpointPath.startsWith(routePath) &&
  endpointPath.split('/').length - 1 === routePath.split('/').length

const renderRoute = (route: Route, { constructors }: ClassMeta): string => `
/*
* Automatically generated by generate-routes.ts.
* Do not edit this file or add other files to this directory.
*/

${renderImports(route)}

${renderClass(route, { constructors })}

${renderExports(route)}
`

const renderImports = ({ namespace, subresources }: Route): string =>
  `
import type {
  RouteRequestBody,
  RouteRequestParams,
  RouteResponse,
} from '@seamapi/types/connect'
import type { SetNonNullable } from 'lib/types.js'

import {
  getAuthHeadersForClientSessionToken,
  warnOnInsecureuserIdentifierKey,
} from 'lib/seam/connect/auth.js'
import {
  type Client,
  type ClientOptions,
  createClient,
} from 'lib/seam/connect/client.js'
import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  isSeamHttpOptionsWithConsoleSessionToken,
  isSeamHttpOptionsWithPersonalAccessToken,
  type SeamHttpFromPublishableKeyOptions,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
  type SeamHttpOptionsWithConsoleSessionToken,
  type SeamHttpOptionsWithPersonalAccessToken,
  type SeamHttpRequestOptions,
} from 'lib/seam/connect/options.js'
import {
  limitToSeamHttpRequestOptions,
  parseOptions
} from 'lib/seam/connect/parse-options.js'
import {
  resolveActionAttempt,
} from 'lib/seam/connect/resolve-action-attempt.js'
import { SeamHttpRequest } from 'lib/seam/connect/seam-http-request.js'

${
  namespace === 'client_sessions'
    ? ''
    : "import { SeamHttpClientSessions } from './client-sessions.js'"
}
${
  namespace === 'action_attempts'
    ? ''
    : "import { SeamHttpActionAttempts } from './action-attempts.js'"
}
${subresources
  .map((subresource) => renderSubresourceImport(subresource, namespace))
  .join('\n')}
`
const renderSubresourceImport = (
  subresource: string,
  namespace: string,
): string => `
    import {
      SeamHttp${pascalCase(namespace)}${pascalCase(subresource)}
    } from './${kebabCase(namespace)}-${kebabCase(subresource)}.js'
`

const renderClass = (
  { namespace, endpoints, subresources }: Route,
  { constructors }: ClassMeta,
): string =>
  `
export class SeamHttp${pascalCase(namespace)} {
  client: Client
  readonly defaults: Required<SeamHttpRequestOptions>

  ${constructors
    .replaceAll(': SeamHttp ', `: SeamHttp${pascalCase(namespace)} `)
    .replaceAll('<SeamHttp>', `<SeamHttp${pascalCase(namespace)}>`)
    .replaceAll(
      'SeamHttp.fromClientSessionToken',
      `SeamHttp${pascalCase(namespace)}.fromClientSessionToken`,
    )
    .replaceAll('new SeamHttp(', `new SeamHttp${pascalCase(namespace)}(`)}

  ${subresources
    .map((subresource) => renderSubresourceMethod(subresource, namespace))
    .join('\n')}

  ${endpoints.map(renderClassMethod).join('\n')}
}
`

const renderClassMethod = ({
  name,
  requestFormat,
  method,
  namespace,
  resource,
  path,
  isRequestParamOptional,
}: Endpoint): string => `
  ${camelCase(name)}(
    ${requestFormat}${isRequestParamOptional ? '?' : ''}: ${renderRequestType({
      name,
      namespace,
    })},
    ${renderClassMethodOptions({ resource })}
  ): SeamHttpRequest<${
    resource === null
      ? 'void, undefined'
      : `${renderResponseType({ name, namespace })}, '${resource}'`
  }> {
    return new SeamHttpRequest(this, {
      path: '${path}',
      method: '${snakeCase(method)}', ${
        requestFormat === 'params' ? 'params,' : ''
      } ${requestFormat === 'body' ? 'body,' : ''}
      responseKey: ${resource === null ? 'undefined' : `'${resource}'`},
      ${resource === 'action_attempt' ? 'options' : ''}
    })
  }
  `

const renderClassMethodOptions = ({
  resource,
}: Pick<Endpoint, 'resource'>): string => {
  if (resource === 'action_attempt') {
    return `options: ${renderClassMethodOptionsTypeDef({
      resource,
    })} = {},`
  }
  return ''
}

const renderClassMethodOptionsType = ({
  name,
  namespace,
}: Pick<Endpoint, 'name' | 'namespace'>): string =>
  [pascalCase(namespace), pascalCase(name), 'Options'].join('')

const renderClassMethodOptionsTypeDef = ({
  resource,
}: Pick<Endpoint, 'resource'>): string => {
  if (resource === 'action_attempt') {
    return "Pick<SeamHttpRequestOptions, 'waitForActionAttempt'>"
  }
  return 'never'
}

const renderSubresourceMethod = (
  subresource: string,
  namespace: string,
): string => `
  get ${camelCase(subresource)} (): SeamHttp${pascalCase(
    namespace,
  )}${pascalCase(subresource)} {
    return SeamHttp${pascalCase(namespace)}${pascalCase(
      subresource,
    )}.fromClient(this.client, this.defaults)
  }
`

const renderExports = (route: Route): string =>
  route.endpoints.map(renderEndpointExports).join('\n')

const renderEndpointExports = ({
  name,
  path,
  namespace,
  resource,
  requestFormat,
}: Endpoint): string => `
export type ${renderRequestType({
  name,
  namespace,
})} = RouteRequest${pascalCase(requestFormat)}<'${path}'>

export type ${renderResponseType({ name, namespace })}= SetNonNullable<
  Required<RouteResponse<'${path}'>>
>

export type ${renderClassMethodOptionsType({
  name,
  namespace,
})} = ${renderClassMethodOptionsTypeDef({ resource })}
  `

const renderRequestType = ({
  name,
  namespace,
}: Pick<Endpoint, 'name' | 'namespace'>): string =>
  [
    pascalCase(namespace),
    pascalCase(name),
    pascalCase(requestFormatToRequestType(name, namespace)),
  ].join('')

// UPSTREAM: This function is a workaround, as the request type should always match the request format.
// Blocked on https://github.com/seamapi/nextlove/issues/117
// and https://github.com/seamapi/javascript-http/issues/43
const requestFormatToRequestType = (
  name: string,
  namespace: string,
): 'params' | 'body' => {
  if (namespace.includes('simulate')) return 'body'
  if (['get', 'list', 'view'].includes(name)) return 'params'
  if (['delete'].includes(name)) return 'params'
  if (name.includes('revoke')) return 'params'
  if (name.includes('remove')) return 'params'
  if (name.includes('deactivate')) return 'params'
  if (name.startsWith('list')) return 'params'
  return 'body'
}

const renderResponseType = ({
  name,
  namespace,
}: Pick<Endpoint, 'name' | 'namespace'>): string =>
  [pascalCase(namespace), pascalCase(name), 'Response'].join('')

const getClassConstructors = (data: string): string => {
  const lines = data.split('\n')

  const startIdx = lines.findIndex((line) =>
    line.trim().startsWith('constructor('),
  )
  if (startIdx === -1) {
    throw new Error('Could not find start of class constructors')
  }

  const endIdx = lines.findIndex((line) => line.trim().startsWith('get '))
  if (endIdx === -1) {
    throw new Error('Could not find end of class constructors')
  }

  return lines.slice(startIdx, endIdx).join('\n')
}

const writeRoute = async (route: Route): Promise<string> => {
  const rootClass = await readFile(rootClassPath)
  const constructors = getClassConstructors(rootClass.toString())
  const name = `${kebabCase(route.namespace)}.ts`
  await write(renderRoute(route, { constructors }), routeOutputPath, name)
  return name
}

const writeRoutesIndex = async (routes: Route[]): Promise<string> => {
  const exports = routes.map(
    (route) => `export * from './${kebabCase(route.namespace)}.js'`,
  )
  const name = 'index.ts'
  await write(exports.join('\n'), routeOutputPath, name)
  return name
}

const write = async (data: string, ...path: string[]): Promise<void> => {
  const filePath = resolve(...path)
  await writeFile(
    filePath,
    '// Generated empty file to allow ESLint parsing by filename',
  )
  const fixedOutput = await eslintFixOutput(data, filePath)
  const prettyOutput = await prettierOutput(fixedOutput, filePath)
  await writeFile(filePath, prettyOutput)
}

const prettierOutput = async (
  data: string,
  filepath: string,
): Promise<string> => {
  const config = await resolveConfig(filepath)
  if (config == null) {
    throw new Error('Failed to resolve Prettier config')
  }
  return await format(data, { ...config, filepath })
}

const eslintFixOutput = async (
  data: string,
  filePath: string,
): Promise<string> => {
  const eslint = new ESLint({ fix: true })

  const [linted] = await eslint.lintText(data, { filePath })

  if (linted == null) {
    throw new Error('ESLint returned empty results')
  }

  if (linted.fatalErrorCount > 0) {
    throw new Error(
      `ESLint returned fatal errors:\n${JSON.stringify(
        linted.messages,
        null,
        2,
      )}`,
    )
  }

  return linted.output ?? linted.source ?? data
}

await main()
