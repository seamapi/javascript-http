import type { Endpoint, Namespace, Parameter, Route } from '@seamapi/blueprint'
import type { Method } from 'axios'
import { camelCase, kebabCase, pascalCase } from 'change-case'

import { getResourceTypeName } from './resources.js'

export interface RouteLayoutContext {
  className: string
  endpoints: EndpointLayoutContext[]
  subroutes: SubrouteLayoutContext[]
  skipClientSessionImport: boolean
  needsActionAttemptsImport: boolean
  needsRequireAtLeastOneImport: boolean
  resourceTypeImports: ResourceTypeImport[]
}

export interface RouteIndexLayoutContext {
  routes: string[]
}

export interface EndpointLayoutContext {
  description: string
  isDeprecated: boolean
  deprecationMessage: string
  path: string
  methodName: string
  functionName: string
  className: string
  method: Method
  responseKey: string
  hasPagination: boolean
  requestFormat: 'params' | 'body'
  parametersTypeName: string
  responseTypeName: string
  optionsTypeName: string
  requestTypeName: string
  returnsActionAttempt: boolean
  returnsVoid: boolean
  isOptionalParamsOk: boolean
  hasRequiredParameters: boolean
  requiredParameterNames: string[]
  requiresAtLeastOneParameter: boolean
  atLeastOneParameterNames: string[]
  atLeastOneParameterNamesUnion: string
  parameters: Parameter[]
  responseIsList: boolean
  responseResourceTypeName: string
}

export interface SubrouteLayoutContext {
  methodName: string
  className: string
  fileName: string
}

interface ResourceTypeImport {
  fileName: string
  typeName: string
}

export const setRouteLayoutContext = (
  file: Partial<RouteLayoutContext>,
  node: Route | Namespace | null,
  nodes: Array<Route | Namespace>,
): void => {
  file.className = getClassName(node?.path ?? null)
  file.skipClientSessionImport =
    node == null || node?.path === '/client_sessions'
  file.needsActionAttemptsImport =
    node != null &&
    node.path !== '/action_attempts' &&
    'endpoints' in node &&
    node.endpoints.some(isActionAttemptEndpoint)
  file.needsRequireAtLeastOneImport =
    node != null &&
    'endpoints' in node &&
    node.endpoints.some(
      (endpoint) => getAtLeastOneParameterNames(endpoint).length > 0,
    )
  file.resourceTypeImports =
    node != null && 'endpoints' in node
      ? [
          ...new Set(node.endpoints.flatMap(getEndpointResponseResourceTypes)),
        ].map((resourceType) => ({
          fileName: `${kebabCase(resourceType)}.js`,
          typeName: getResourceTypeName(resourceType),
        }))
      : []

  file.endpoints = []
  if (node != null && 'endpoints' in node) {
    file.endpoints = node.endpoints.map((endpoint) =>
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

  const batchResourceKeys = getBatchResourceKeys(endpoint)

  if (
    endpoint.response.responseType !== 'void' &&
    endpoint.response.resourceType === 'unknown' &&
    batchResourceKeys.length === 0
  ) {
    throw new Error(
      `Cannot generate ${endpoint.path}: response resource type is unknown`,
    )
  }

  const requestFormat = ['GET', 'DELETE'].includes(
    endpoint.request.preferredMethod,
  )
    ? 'params'
    : 'body'

  const returnsActionAttempt = isActionAttemptEndpoint(endpoint)

  const methodName = camelCase(endpoint.name)

  return {
    description: endpoint.description,
    isDeprecated: endpoint.isDeprecated,
    deprecationMessage: endpoint.deprecationMessage,
    path: endpoint.path,
    methodName,
    functionName: camelCase(prefix),
    method: endpoint.request.preferredMethod,
    hasPagination: endpoint.hasPagination,
    className: getClassName(route.path),
    requestFormat,
    returnsActionAttempt,
    parametersTypeName: `${prefix}Parameters`,
    responseTypeName: `${prefix}Response`,
    optionsTypeName: `${prefix}Options`,
    requestTypeName: `${prefix}Request`,
    isOptionalParamsOk: !endpoint.request.hasRequiredParameters,
    hasRequiredParameters: endpoint.request.hasRequiredParameters,
    requiredParameterNames: endpoint.request.parameters
      .filter(({ isRequired }) => isRequired)
      .map(({ name }) => name),
    requiresAtLeastOneParameter:
      getAtLeastOneParameterNames(endpoint).length > 0,
    atLeastOneParameterNames: getAtLeastOneParameterNames(endpoint),
    atLeastOneParameterNamesUnion: getAtLeastOneParameterNames(endpoint)
      .map((name) => `'${name}'`)
      .join(' | '),
    parameters: endpoint.request.parameters,
    responseIsList: endpoint.response.responseType === 'resource_list',
    responseResourceTypeName:
      endpoint.response.responseType === 'void'
        ? ''
        : batchResourceKeys.length > 0
          ? `Batch<${batchResourceKeys.map((key) => `'${key}'`).join(' | ')}>`
          : getResourceTypeName(endpoint.response.resourceType),
    ...getResponseContext(endpoint),
  }
}

const requiresAtLeastOneParameter = (endpoint: Endpoint): boolean =>
  endpoint.request.hasRequiredParameters &&
  endpoint.request.parameters.every(({ isRequired }) => !isRequired)

const paginationParameterNames = new Set(['limit', 'page_cursor'])

const getAtLeastOneParameterNames = (endpoint: Endpoint): string[] =>
  requiresAtLeastOneParameter(endpoint)
    ? endpoint.request.parameters
        .map(({ name }) => name)
        .filter((name) => !paginationParameterNames.has(name))
    : []

const isActionAttemptEndpoint = (endpoint: Endpoint): boolean =>
  endpoint.response.responseType === 'resource' &&
  endpoint.response.resourceType === 'action_attempt'

const getEndpointResponseResourceTypes = (endpoint: Endpoint): string[] => {
  if (endpoint.response.responseType === 'void') return []
  if (endpoint.response.responseType === 'resource') {
    const { batchResourceTypes } = endpoint.response
    if (batchResourceTypes != null) return ['batch']
  }
  return [endpoint.response.resourceType]
}

const getBatchResourceKeys = (endpoint: Endpoint): string[] => {
  if (endpoint.response.responseType !== 'resource') return []
  return (
    endpoint.response.batchResourceTypes?.map(({ batchKey }) => batchKey) ?? []
  )
}

const getResponseContext = (
  endpoint: Endpoint,
): Pick<EndpointLayoutContext, 'returnsVoid' | 'responseKey'> => {
  if (endpoint.response.responseType === 'void') {
    return {
      returnsVoid: true,
      responseKey: '',
    }
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
