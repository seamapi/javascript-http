import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { camelCase, pascalCase, snakeCase } from 'change-case'
import { format, resolveConfig } from 'prettier'

interface Route {
  namespace: string
  endpoints: Endpoint[]
}

interface Endpoint {
  name: string
  path: string
  namespace: string
  resource: string
  method: 'GET' | 'POST'
  requestFormat: 'params' | 'body'
}

const renderRoute = (route: Route): string => `
${renderImports()}

${renderClass(route)}

${renderExports(route)}
`

const renderImports = (): string =>
  `
import type { RouteRequestParams, RouteResponse } from '@seamapi/types/connect'
import { Axios } from 'axios'
import type { SetNonNullable } from 'type-fest'

import { createAxiosClient } from 'lib/seam/connect/axios.js'
import type { SeamHttpOptions } from 'lib/seam/connect/client-options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'
`

const renderClass = ({ endpoints }: Route): string =>
  `
export class SeamHttpWorkspaces {
  client: Axios

  constructor(apiKeyOrOptionsOrClient: Axios | string | SeamHttpOptions) {
    if (apiKeyOrOptionsOrClient instanceof Axios) {
      this.client = apiKeyOrOptionsOrClient
      return
    }

    const options = parseOptions(apiKeyOrOptionsOrClient)
    this.client = createAxiosClient(options)
  }

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
    ${requestFormat}: ${renderRequestType({
      name,
      namespace,
      requestFormat,
    })} = {},
  ): Promise<${renderResponseType({ name, namespace })}['${resource}']> {
    const { data } = await this.client.request<${renderResponseType({
      name,
      namespace,
    })}>({
      url: '${path}',
      method: '${snakeCase(method)}', ${
        requestFormat === 'params' ? 'params,' : ''
      } ${requestFormat === 'body' ? 'data: body,' : ''}
    })
    return data.${resource}
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
type ${renderRequestType({
  name,
  namespace,
  requestFormat,
})} = SetNonNullable<
  Required<RouteRequest${pascalCase(requestFormat)}<'${path}'>>
>

type ${renderResponseType({ name, namespace })}= SetNonNullable<
  Required<RouteResponse<'${path}'>>
>
  `

const getRequestFormat = (
  method: Endpoint['method'],
): Endpoint['requestFormat'] =>
  ['GET', 'DELETE'].includes(method) ? 'params' : 'body'

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

const exampleRoute: Route = {
  namespace: 'workspaces',
  endpoints: [
    {
      name: 'get',
      namespace: 'workspaces',
      path: '/workspaces/get',
      method: 'GET',
      resource: 'workspace',
      requestFormat: getRequestFormat('GET'),
    },
  ],
}

const write = async (data: string, ...path: string[]): Promise<void> => {
  const filepath = resolve(...path)
  const prettierConfig = await resolveConfig(filepath)
  if (prettierConfig == null) {
    throw new Error('Failed to resolve Prettier config')
  }
  const output = await format(data, { ...prettierConfig, filepath })
  await writeFile(filepath, output)
}

const routeRootPath = resolve('src', 'lib', 'seam', 'connect', 'routes')

await write(renderRoute(exampleRoute), routeRootPath, 'workspaces.ts')
