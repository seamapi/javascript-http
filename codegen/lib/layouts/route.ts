import type { Endpoint, Namespace, Parameter, Route } from '@seamapi/blueprint'
import type { Method } from 'axios'
import { camelCase, kebabCase, pascalCase } from 'change-case'

import { getResourceTypeName } from './resources.js'

export interface RouteLayoutContext {
  className: string
  isUndocumented: boolean
  endpoints: EndpointLayoutContext[]
  subroutes: SubrouteLayoutContext[]
  skipClientSessionImport: boolean
  hasLegacyTypes: boolean
  resourceTypeImports: ResourceTypeImport[]
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
  responseKey: string
  requestFormat: 'params' | 'body'
  parametersTypeName: string
  legacyRequestTypeName: string
  responseTypeName: string
  requestFormatSuffix: string
  optionsTypeName: string
  requestTypeName: string
  returnsActionAttempt: boolean
  returnsVoid: boolean
  isOptionalParamsOk: boolean
  isUndocumented: boolean
  usesLegacyResponseType: boolean
  parametersType: string
  responseType: string
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
  file.isUndocumented = node?.isUndocumented ?? false
  file.skipClientSessionImport =
    node == null || node?.path === '/client_sessions'
  file.hasLegacyTypes =
    node != null && 'endpoints' in node
      ? node.endpoints.some(
          (endpoint) =>
            endpoint.isUndocumented ||
            (endpoint.response.responseType === 'resource' &&
              endpoint.response.resourceType === 'action_attempt'),
        )
      : false
  file.resourceTypeImports =
    node != null && 'endpoints' in node
      ? [
          ...new Set(
            node.endpoints.flatMap((endpoint) => {
              if (
                endpoint.isUndocumented ||
                endpoint.response.responseType === 'void' ||
                (endpoint.response.responseType === 'resource' &&
                  endpoint.response.resourceType === 'action_attempt')
              ) {
                return []
              }
              return [endpoint.response.resourceType]
            }),
          ),
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
  route: Pick<Route, 'path' | 'name' | 'isUndocumented'>,
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

  const legacyMethodParamName = ['GET', 'DELETE'].includes(
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
    className: getClassName(route.path),
    requestFormat,
    requestFormatSuffix,
    returnsActionAttempt,
    parametersTypeName: `${prefix}Parameters`,
    legacyRequestTypeName: `${prefix}${pascalCase(legacyMethodParamName)}`,
    responseTypeName: `${prefix}Response`,
    optionsTypeName: `${prefix}Options`,
    requestTypeName: `${prefix}Request`,
    isOptionalParamsOk: endpoint.request.parameters.every(
      (parameter) => !parameter.isRequired,
    ),
    isUndocumented: endpoint.isUndocumented,
    usesLegacyResponseType: endpoint.isUndocumented || returnsActionAttempt,
    parametersType: renderObject(endpoint.request.parameters, renderParameter),
    responseType: renderResponse(endpoint),
    ...getResponseContext(endpoint),
  }
}

const renderResponse = (endpoint: Endpoint): string => {
  const { response } = endpoint
  if (response.responseType === 'void') return 'void'

  const { resourceType, responseKey, responseType } = response
  const resource = getResourceTypeName(resourceType)
  const value =
    responseType === 'resource_list' ? `Array<${resource}>` : resource
  return `{ ${JSON.stringify(responseKey)}: ${value} }`
}

const renderObject = <T extends { name: string }>(
  members: T[],
  render: (member: T) => string,
): string =>
  `{ ${members
    .map((member) => {
      const isOptional =
        ('isRequired' in member && !member.isRequired) ||
        ('isOptional' in member && member.isOptional)
      return `${JSON.stringify(member.name)}${isOptional ? '?' : ''}: ${render(member)}${isOptional ? ' | undefined' : ''}`
    })
    .join('; ')} }`

const renderParameter = (parameter: Parameter): string => {
  if (parameter.format === 'object') {
    return renderObject(parameter.parameters, renderParameter)
  }
  if (parameter.format === 'list') {
    if (parameter.itemFormat === 'object') {
      return `Array<${renderObject(parameter.itemParameters, renderParameter)}>`
    }
    if (parameter.itemFormat === 'discriminated_object') {
      return `Array<${parameter.variants
        .map(({ parameters }) => renderObject(parameters, renderParameter))
        .join(' | ')}>`
    }
    return `Array<${renderScalar(parameter.itemFormat, parameter)}>`
  }
  return renderScalar(parameter.format, parameter)
}

const renderScalar = (format: string, value: unknown): string => {
  if (format === 'boolean') return 'boolean'
  if (format === 'number') return 'number'
  if (format === 'record') return 'Record<string, unknown>'
  if (format === 'enum') {
    const enumValue = value as {
      values?: Array<{ name: string }>
      itemEnumValues?: Array<{ name: string }>
    }
    const values = enumValue.values ?? enumValue.itemEnumValues ?? []
    return values.length === 0
      ? 'string'
      : values.map(({ name }) => JSON.stringify(name)).join(' | ')
  }
  return 'string'
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
