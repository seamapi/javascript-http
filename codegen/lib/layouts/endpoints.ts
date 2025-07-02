import type { Endpoint, Route } from '@seamapi/blueprint'

import {
  type EndpointLayoutContext,
  getClassName,
  getEndpointLayoutContext,
  toFilePath,
} from './route.js'

export interface EndpointsLayoutContext {
  className: string
  typeNamePrefix: string
  withoutWorkspace: boolean
  endpoints: EndpointLayoutContext[]
  endpointReadPaths: string[]
  endpointPaginatedPaths: string[]
  endpointWritePaths: string[]
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
  { withoutWorkspace = false }: { withoutWorkspace?: boolean } = {},
): void => {
  const endpointFilter = (endpoint: Endpoint): boolean =>
    withoutWorkspace ? endpoint.workspaceScope !== 'required' : true

  file.withoutWorkspace = withoutWorkspace
  file.className = getClassName(
    `Endpoints${withoutWorkspace ? 'WithoutWorkspace' : ''}`,
  )
  file.typeNamePrefix = getClassName(
    `Endpoint${withoutWorkspace ? 'WithoutWorkspace' : ''}`,
  )
  file.skipClientSessionImport = true
  file.endpoints = routes.flatMap((route) =>
    route.endpoints
      .filter(endpointFilter)
      .map((endpoint) => getEndpointLayoutContext(endpoint, route)),
  )
  file.endpointReadPaths = routes.flatMap((route) =>
    route.endpoints
      .filter(endpointFilter)
      .filter(({ request }) => request.semanticMethod === 'GET')
      .map(({ path }) => path),
  )
  file.endpointPaginatedPaths = routes.flatMap((route) =>
    route.endpoints
      .filter(endpointFilter)
      .filter(
        ({ request, hasPagination }) =>
          request.semanticMethod === 'GET' && hasPagination,
      )
      .map(({ path }) => path),
  )
  file.endpointWritePaths = routes.flatMap((route) =>
    route.endpoints
      .filter(endpointFilter)
      .filter(({ request }) => request.semanticMethod !== 'GET')
      .map(({ path }) => path),
  )
  file.routeImports = routes
    .filter((route) => route.endpoints.some(endpointFilter))
    .map((route) => {
      const endpoints = route.endpoints
        .filter(endpointFilter)
        .map((endpoint) => getEndpointLayoutContext(endpoint, route))

      return {
        className: getClassName(route.path),
        fileName: `${toFilePath(route.path)}/index.js`,
        typeNames: endpoints.flatMap((endpoint) => [
          endpoint.parametersTypeName,
          endpoint.optionsTypeName,
          endpoint.requestTypeName,
        ]),
      }
    })
}
