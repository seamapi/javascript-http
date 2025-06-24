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

export interface EndpointLayoutContext {
  path: string
  methodName: string
  functionName: string
  className: string
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

export interface SubrouteLayoutContext {
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

export const getEndpointLayoutContext = (
  endpoint: Endpoint,
  route: Pick<Route, 'path' | 'name'>,
): EndpointLayoutContext => {
  const prefix = pascalCase([route.path.split('/'), endpoint.name].join('_'))

  const methodParamName = ['GET', 'DELETE'].includes(
    endpoint.request.semanticMethod,
  )
    ? 'params'
    : 'body'

  const requestFormat = ['GET', 'DELETE'].includes(
    endpoint.request.preferredMethod,
  )
    ? 'params'
    : 'body'

  const requestFormatSuffix = pascalCase(requestFormat)

  const returnsActionAttempt =
    endpoint.response.responseType === 'resource' &&
    endpoint.response.resourceType === 'action_attempt'

  const methodName = camelCase(endpoint.name)

  return {
    path: endpoint.path,
    methodName,
    functionName: camelCase(prefix),
    method: endpoint.request.preferredMethod,
    hasOptions: returnsActionAttempt,
    className: getClassName(route.path),
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

export const getClassName = (path: string | null): string =>
  `SeamHttp${pascalCase(path ?? '')}`

export const toFilePath = (path: string): string =>
  path
    .slice(1)
    .split('/')
    .map((p) => kebabCase(p))
    .join('/')
