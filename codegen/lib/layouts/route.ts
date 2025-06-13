import type { Endpoint, Namespace, Route } from '@seamapi/blueprint'
import type { Method } from 'axios'
import { camelCase, kebabCase, pascalCase } from 'change-case'

export interface RouteLayoutContext {
  className: string
  endpoints: EndpointLayoutContext[]
  subroutes: SubrouteLayoutContext[]
  skipClientSessionImport: boolean
}

export interface RouteIndexLayoutContext {
  routes: string[]
}

interface EndpointLayoutContext {
  path: string
  methodName: string
  method: Method
  hasOptions: boolean
  responseKey: string
  methodParamName: 'params' | 'body'
  requestFormat: 'params' | 'body'
  requestTypeName: string
  responseTypeName: string
  requestFormatSuffix: string
  optionsTypeName: string
  returnsActionAttempt: boolean
  returnsVoid: boolean
  isOptionalParamsOk: boolean
}

interface SubrouteLayoutContext {
  methodName: string
  className: string
  fileName: string
}

export const setRouteLayoutContext = (
  file: Partial<RouteLayoutContext>,
  node: Route | Namespace | null,
  nodes: Array<Route | Namespace>,
): void => {
  file.className = getClassName(node?.path ?? null)
  file.skipClientSessionImport =
    node == null || node?.path === '/client_sessions'

  file.endpoints = []
  if (node != null && 'endpoints' in node) {
    const endpoints = node.endpoints.filter(
      ({ isUndocumented }) => !isUndocumented,
    )
    file.endpoints = endpoints.map((endpoint) =>
      getEndpointLayoutContext(endpoint, node),
    )
  }

  file.subroutes = nodes
    .sort((n1, n2) => n1.name.localeCompare(n2.name))
    .filter(({ parentPath }) => parentPath === (node?.path ?? null))
    .map((r) => getSubrouteLayoutContext(r))
}

const getSubrouteLayoutContext = (
  route: Pick<Route, 'path' | 'name'>,
): SubrouteLayoutContext => {
  return {
    fileName: `${kebabCase(route.name)}/index.js`,
    methodName: camelCase(route.name),
    className: getClassName(route.path),
  }
}

const getEndpointLayoutContext = (
  endpoint: Endpoint,
  route: Pick<Route, 'path' | 'name'>,
): EndpointLayoutContext => {
  const prefix = pascalCase([route.path.split('/'), endpoint.name].join('_'))

  const methodParamName = getMethodParamName(endpoint.name, route.name)

  const requestFormat = ['GET', 'DELETE'].includes(
    endpoint.request.preferredMethod,
  )
    ? 'params'
    : 'body'

  const requestFormatSuffix = pascalCase(requestFormat)

  const returnsActionAttempt =
    endpoint.response.responseType === 'resource' &&
    endpoint.response.resourceType === 'action_attempt'

  return {
    path: endpoint.path,
    methodName: camelCase(endpoint.name),
    method: endpoint.request.preferredMethod,
    hasOptions: returnsActionAttempt,
    methodParamName,
    requestFormat,
    requestFormatSuffix,
    returnsActionAttempt,
    requestTypeName: `${prefix}${pascalCase(methodParamName)}`,
    responseTypeName: `${prefix}Response`,
    optionsTypeName: `${prefix}Options`,
    // UPSTREAM: Needs support in blueprint, fallback to true for now.
    // https://github.com/seamapi/blueprint/issues/205
    isOptionalParamsOk: true,
    ...getResponseContext(endpoint),
  }
}

const getResponseContext = (
  endpoint: Endpoint,
): Pick<EndpointLayoutContext, 'returnsVoid' | 'responseKey'> => {
  if (endpoint.response.responseType === 'void')
    return {
      returnsVoid: true,
      responseKey: '',
    }
  const { responseKey } = endpoint.response
  return {
    returnsVoid: false,
    responseKey,
  }
}

const getClassName = (name: string | null): string =>
  `SeamHttp${pascalCase(name ?? '')}`

const getMethodParamName = (
  endpointName: string,
  routeName: string,
): 'params' | 'body' => {
  // UPSTREAM: This function implements a workaround, as the request format should always follow the semantic method.
  // Blocked on https://github.com/seamapi/nextlove/issues/117
  // and https://github.com/seamapi/javascript-http/issues/43
  //
  // The desired implementation:
  //
  // return ['GET', 'DELETE'].includes(endpoint.request.semanticMethod)
  //   ? 'params'
  //   : 'body'

  if (routeName.includes('simulate')) return 'body'
  if (['get', 'list', 'view'].includes(endpointName)) return 'params'
  if (['delete'].includes(endpointName)) return 'params'
  if (endpointName.includes('revoke')) return 'params'
  if (endpointName.includes('remove')) return 'params'
  if (endpointName.includes('deactivate')) return 'params'
  if (endpointName.startsWith('list')) return 'params'
  return 'body'
}
