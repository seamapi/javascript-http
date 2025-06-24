import type { Route } from '@seamapi/blueprint'

import {
  type EndpointLayoutContext,
  getClassName,
  getEndpointLayoutContext,
  type SubrouteLayoutContext,
  toFilePath,
} from './route.js'

export interface EndpointsLayoutContext {
  className: string
  endpoints: EndpointLayoutContext[]
  routeImports: Array<Pick<SubrouteLayoutContext, 'className' | 'fileName'>>
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
  file.routeImports = routes.map((route) => {
    return {
      className: getClassName(route.path),
      fileName: `${toFilePath(route.path)}/index.js`,
    }
  })
}
