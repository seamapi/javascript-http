import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { openapi } from '@seamapi/types/connect'
import { camelCase, paramCase, pascalCase, snakeCase } from 'change-case'
import { ESLint } from 'eslint'
import pluralize from 'pluralize'
import { format, resolveConfig } from 'prettier'

const rootClassPath = resolve('src', 'lib', 'seam', 'connect', 'client.ts')
const routeOutputPath = resolve('src', 'lib', 'seam', 'connect', 'routes')

const routePaths: string[] = [
  '/access_codes',
  '/access_codes/unmanaged',
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
  '/noise_sensors/noise_thresholds',
  '/thermostats/climate_setting_schedules',
  '/thermostats',
  '/webhooks',
  '/workspaces',
]

const ignoredEndpointPaths = [
  '/access_codes/simulate/create_unmanaged_access_code',
  '/health',
  '/health/get_health',
  '/health/get_service_health',
  '/health/service/[service_name]',
  '/noise_sensors/simulate/trigger_noise_threshold',
]

const endpointResources: Partial<
  Record<
    keyof typeof openapi.paths,
    | 'action_attempt'
    | 'device_providers'
    | 'generated_code'
    | 'backup_access_code'
    | 'acs_users'
    | null
  >
> = {
  '/access_codes/generate_code': 'generated_code',
  '/access_codes/pull_backup_access_code': 'backup_access_code',
  '/acs/users/add_to_access_group': null,
  '/acs/users/remove_from_access_group': null,
  '/acs/access_groups/list_users': 'acs_users',
  '/acs/access_groups/remove_user': null,
  '/connect_webviews/view': null,
  '/devices/list_device_providers': 'device_providers',
  '/locks/lock_door': null,
  '/locks/unlock_door': null,
  '/noise_sensors/noise_thresholds/create': null,
  '/thermostats/cool': null,
  '/thermostats/heat': null,
  '/thermostats/heat_cool': null,
  '/thermostats/off': null,
  '/thermostats/set_fan_mode': null,
  '/workspaces/reset_sandbox': null,
}

interface Route {
  namespace: string
  endpoints: Endpoint[]
}

interface Endpoint {
  name: string
  path: string
  namespace: string
  resource: string | null
  method: Method
  requestFormat: 'params' | 'body'
}

type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH'

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
    .filter((path) => !ignoredEndpointPaths.includes(path))

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

const createRoute = (routePath: string): Route => {
  const endpointPaths = Object.keys(openapi.paths).filter((path) =>
    isEndpointUnderRoute(path, routePath),
  )

  const namespace = routePath.split('/').join('_').slice(1)

  return {
    namespace,
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
    resource: deriveResource(endpointPath, routePath, name, method),
    requestFormat: ['GET', 'DELETE'].includes(method) ? 'params' : 'body',
  }
}

const deriveResource = (
  endpointPath: string,
  routePath: string,
  name: string,
  method: Method,
): string | null => {
  if (endpointPath in endpointResources) {
    return (
      endpointResources[endpointPath as keyof typeof endpointResources] ?? null
    )
  }
  if (['DELETE', 'PATCH', 'PUT'].includes(method)) return null
  if (['update', 'delete'].includes(name)) return null
  const group = deriveGroupFromRoutePath(routePath)
  if (group == null) throw new Error(`Could not parse group from ${routePath}`)
  if (name === 'list') return group
  return pluralize.singular(group)
}

const deriveGroupFromRoutePath = (routePath: string): string | undefined => {
  const parts = routePath.split('/').slice(1)

  if (routePath.endsWith('/unmanaged')) {
    return parts[0]
  }

  if (routePath.startsWith('/acs')) {
    return [parts[0], parts[1]].join('_')
  }

  if (parts.length === 2) {
    return parts[1]
  }

  return parts[0]
}

const deriveSemanticMethod = (methods: string[]): Method => {
  if (methods.includes('get')) return 'GET'
  if (methods.includes('delete')) return 'DELETE'
  if (methods.includes('patch')) return 'PATCH'
  if (methods.includes('put')) return 'PUT'
  if (methods.includes('post')) return 'POST'
  throw new Error(`Could not find valid method in ${methods.join(', ')}`)
}

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

${renderImports()}

${renderClass(route, { constructors })}

${renderExports(route)}
`

const renderImports = (): string =>
  `
import type { RouteRequestParams, RouteResponse, RouteRequestBody } from '@seamapi/types/connect'
import { Axios } from 'axios'
import type { SetNonNullable } from 'type-fest'

import { createAxiosClient } from 'lib/seam/connect/axios.js'
import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
} from 'lib/seam/connect/client-options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'
`

const renderClass = (
  { namespace, endpoints }: Route,
  { constructors }: ClassMeta,
): string =>
  `
export class SeamHttp${pascalCase(namespace)} {
  client: Axios

  ${constructors
    .replace(/.*this\.#legacy.*\n/, '')
    .replaceAll(': SeamHttp ', `: SeamHttp${pascalCase(namespace)} `)
    .replaceAll('new SeamHttp(', `new SeamHttp${pascalCase(namespace)}(`)}

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
})} = SetNonNullable<
  Required<RouteRequest${pascalCase(requestFormat)}<'${path}'>>
>

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

const writeRoute = async (route: Route): Promise<void> => {
  const rootClass = await readFile(rootClassPath)
  const constructors = getClassConstructors(rootClass.toString())
  await write(
    renderRoute(route, { constructors }),
    routeOutputPath,
    `${paramCase(route.namespace)}.ts`,
  )
}

await Promise.all(createRoutes().map(writeRoute))
