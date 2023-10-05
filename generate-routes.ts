import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { openapi } from '@seamapi/types/connect'
import { camelCase, kebabCase, pascalCase, snakeCase } from 'change-case'
import { ESLint } from 'eslint'
import { format, resolveConfig } from 'prettier'

const rootClassPath = resolve('src', 'lib', 'seam', 'connect', 'seam-http.ts')
const routeOutputPath = resolve('src', 'lib', 'seam', 'connect', 'routes')

const routePaths = [
  '/access_codes',
  '/access_codes/unmanaged',
  '/acs',
  '/acs/access_groups',
  '/acs/credentials',
  '/acs/systems',
  '/acs/users',
  '/action_attempts',
  '/client_sessions',
  '/connect_webviews',
  '/connected_accounts',
  '/devices',
  '/devices/unmanaged',
  '/events',
  '/locks',
  '/noise_sensors',
  '/noise_sensors/noise_thresholds',
  '/thermostats/climate_setting_schedules',
  '/thermostats',
  '/webhooks',
  '/workspaces',
] as const

const routePathSubresources: Partial<
  Record<(typeof routePaths)[number], string[]>
> = {
  '/access_codes': ['unmanaged'],
  '/acs': ['access_groups', 'credentials', 'systems', 'users'],
  '/devices': ['unmanaged'],
  '/noise_sensors': ['noise_thresholds'],
  '/thermostats': ['climate_setting_schedules'],
}

const ignoredEndpointPaths = [
  '/access_codes/simulate/create_unmanaged_access_code',
  '/connect_webviews/view',
  '/health',
  '/health/get_health',
  '/health/get_service_health',
  '/health/service/[service_name]',
  '/noise_sensors/simulate/trigger_noise_threshold',
] as const

const endpointResources: Partial<
  Record<
    keyof typeof openapi.paths,
    | 'action_attempt'
    | 'access_codes'
    | 'device_providers'
    | 'generated_code'
    | 'backup_access_code'
    | 'acs_users'
    | null
  >
> = {
  '/access_codes/delete': null,
  '/access_codes/unmanaged/delete': null,
  '/access_codes/update': null,
  '/connect_webviews/view': null,
  '/noise_sensors/noise_thresholds/create': null,
  '/noise_sensors/noise_thresholds/delete': null,
  '/noise_sensors/noise_thresholds/update': null,
  '/thermostats/climate_setting_schedules/update': null,
  '/workspaces/reset_sandbox': null,
} as const

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
}

type Method = 'GET' | 'POST'

interface ClassMeta {
  constructors: string
}

const createRoutes = (): Route[] => {
  const paths = Object.keys(openapi.paths)

  const unmatchedEndpointPaths = paths
    .filter(
      (path) =>
        !routePaths.some((routePath) => isEndpointUnderRoute(path, routePath)),
    )
    .filter(
      (path) => !(ignoredEndpointPaths as unknown as string[]).includes(path),
    )

  if (unmatchedEndpointPaths.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `The following endpoints will not be generated:\n${unmatchedEndpointPaths.join(
        '\n',
      )}`,
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
  if (!isOpenApiPath(endpointPath)) {
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
  }
}

const deriveResource = (
  endpointPath: string,
  method: Method,
): string | null => {
  if (isEndpointResource(endpointPath)) {
    return endpointResources[endpointPath] ?? null
  }

  if (isOpenApiPath(endpointPath)) {
    const spec = openapi.paths[endpointPath]
    const methodKey = method.toLowerCase()

    if (methodKey === 'post' && 'post' in spec) {
      const response = spec.post.responses[200]
      if (!('content' in response)) return null
      return deriveResourceFromSchema(
        response.content['application/json']?.schema?.properties ?? {},
      )
    }

    if (methodKey === 'get' && 'get' in spec) {
      const response = spec.get.responses[200]
      if (!('content' in response)) {
        throw new Error(`Missing resource for ${method} ${endpointPath}`)
      }
      return deriveResourceFromSchema(
        response.content['application/json']?.schema?.properties ?? {},
      )
    }
  }

  throw new Error(`Could not derive resource for ${method} ${endpointPath}`)
}

const deriveResourceFromSchema = (properties: object): string | null =>
  Object.keys(properties).filter((key) => key !== 'ok')[0] ?? null

const deriveSemanticMethod = (methods: string[]): Method => {
  if (methods.includes('get')) return 'GET'
  if (methods.includes('post')) return 'POST'
  throw new Error(`Could not find valid method in ${methods.join(', ')}`)
}

const isEndpointResource = (
  key: string,
): key is keyof typeof endpointResources => key in endpointResources

const isOpenApiPath = (key: string): key is keyof typeof openapi.paths =>
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
import type { RouteRequestParams, RouteResponse, RouteRequestBody } from '@seamapi/types/connect'
import type { SetNonNullable } from 'type-fest'

import { type Client, createClient } from 'lib/seam/connect/client.js'
import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
} from 'lib/seam/connect/options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'
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

  ${constructors
    .replaceAll(': SeamHttp ', `: SeamHttp${pascalCase(namespace)} `)
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
}: Endpoint): string => `
  async ${camelCase(name)}(
    ${requestFormat}${
      requestFormat === 'params' ? '?' : ''
    }: ${renderRequestType({
      name,
      namespace,
      requestFormat,
    })},
  ): Promise<${
    resource === null
      ? 'void'
      : `${renderResponseType({ name, namespace })}['${resource}']`
  }> {
    ${
      resource === null ? '' : 'const { data } = '
    }await this.client.request<${renderResponseType({
      name,
      namespace,
    })}>({
      url: '${path}',
      method: '${snakeCase(method)}', ${
        requestFormat === 'params' ? 'params,' : ''
      } ${requestFormat === 'body' ? 'data: body,' : ''}
    })
    ${resource === null ? '' : `return data.${resource}`}
  }
  `

const renderSubresourceMethod = (
  subresource: string,
  namespace: string,
): string => `
  get ${camelCase(subresource)} (): SeamHttp${pascalCase(
    namespace,
  )}${pascalCase(subresource)} {
    return SeamHttp${pascalCase(namespace)}${pascalCase(
      subresource,
    )}.fromClient(this.client)
  }
`

const renderExports = (route: Route): string =>
  route.endpoints.map(renderEndpointExports).join('\n')

const renderEndpointExports = ({
  name,
  path,
  namespace,
  requestFormat,
}: Endpoint): string => `
export type ${renderRequestType({
  name,
  namespace,
  requestFormat,
})} = RouteRequest${pascalCase(requestFormat)}<'${path}'>

export type ${renderResponseType({ name, namespace })}= SetNonNullable<
  Required<RouteResponse<'${path}'>>
>
  `

const renderRequestType = ({
  name,
  namespace,
  requestFormat,
}: Pick<Endpoint, 'name' | 'namespace' | 'requestFormat'>): string =>
  [pascalCase(namespace), pascalCase(name), pascalCase(requestFormat)].join('')

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

const writeRoute = async (route: Route): Promise<void> => {
  const rootClass = await readFile(rootClassPath)
  const constructors = getClassConstructors(rootClass.toString())
  await write(
    renderRoute(route, { constructors }),
    routeOutputPath,
    `${kebabCase(route.namespace)}.ts`,
  )
}

const writeRoutesIndex = async (routes: Route[]): Promise<void> => {
  const exports = routes.map(
    (route) => `export * from './${kebabCase(route.namespace)}.js'`,
  )
  await write(exports.join('\n'), routeOutputPath, `index.ts`)
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

const routes = createRoutes()
await Promise.all(routes.map(writeRoute))
await writeRoutesIndex(routes)
