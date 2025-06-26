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
  routeImports: RouteImportLayoutContext[]
  skipClientSessionImport: boolean
}

interface RouteImportLayoutContext {
  className: string
  fileName: string
  typeNames: string[]
}

export const setEndpointsLayoutContext = (
  file: Partial<EndpointsLayoutContext>,
  routes: Route[],
): void => {
  file.className = getClassName('Endpoints')
  file.skipClientSessionImport = true
  file.endpoints = routes.flatMap((route) =>
    route.endpoints.map((endpoint) =>
      getEndpointLayoutContext(endpoint, route),
    ),
  )
  file.routeImports = routes.map((route) => {
    const endpoints = route.endpoints.map((endpoint) =>
      getEndpointLayoutContext(endpoint, route),
    )
    return {
      className: getClassName(route.path),
      fileName: `${toFilePath(route.path)}/index.js`,
      typeNames: endpoints.flatMap((endpoint) => [
        endpoint.parametersTypeName,
        endpoint.optionsTypeName,
        endpoint.responseTypeName,
      ]),
    }
  })
}
