import type { Route } from '@seamapi/blueprint'

import {
  type EndpointLayoutContext,
  getClassName,
  getEndpointLayoutContext,
  toFilePath,
} from './route.js'

export interface EndpointsLayoutContext {
  className: string
  endpoints: EndpointLayoutContext[]
  routes: Array<{
    fileName: string
    className: string
    typeNames: string[]
  }>
  skipClientSessionImport: boolean
}

export const setEndpointsLayoutContext = (
  file: Partial<EndpointsLayoutContext>,
  routes: Route[],
): void => {
  file.className = getClassName('Endpoints')
  file.skipClientSessionImport = true
  file.endpoints = routes.flatMap((route) =>
    route.endpoints
      .filter(({ isUndocumented }) => !isUndocumented)
      .map((endpoint) => getEndpointLayoutContext(endpoint, route)),
  )
  file.routes = routes.map((route) => {
    const typeNames = route.endpoints
      .filter(({ isUndocumented }) => !isUndocumented)
      .map((e) => getEndpointLayoutContext(e, route))
      .flatMap((e) => [
        e.optionsTypeName,
        e.requestTypeName,
        e.responseTypeName,
      ])
    return {
      className: getClassName(route.path),
      typeNames,
      fileName: `${toFilePath(route.path)}/index.js`,
    }
  })
}
