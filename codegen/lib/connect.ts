import type { Blueprint } from '@seamapi/blueprint'
import { kebabCase } from 'change-case'
import type Metalsmith from 'metalsmith'

import {
  type EndpointsLayoutContext,
  setEndpointsLayoutContext,
} from './layouts/endpoints.js'
import {
  type RouteIndexLayoutContext,
  type RouteLayoutContext,
  setRouteLayoutContext,
  toFilePath,
} from './layouts/route.js'

interface Metadata {
  blueprint: Blueprint
}

type File = RouteLayoutContext &
  RouteIndexLayoutContext &
  EndpointsLayoutContext & { layout: string }

const rootPath = 'src/lib/seam/connect/routes'

export const connect = (
  files: Metalsmith.Files,
  metalsmith: Metalsmith,
): void => {
  const metadata = metalsmith.metadata() as Metadata
  const { blueprint } = metadata

  const namespaces = blueprint.namespaces.filter(
    ({ isUndocumented }) => !isUndocumented,
  )
  const routes = blueprint.routes.filter(
    ({ isUndocumented }) => !isUndocumented,
  )

  const nodes = [...namespaces, ...routes]

  const routeIndexes: Record<string, Set<string>> = {}

  const k = `${rootPath}/seam-http.ts`
  files[k] = { contents: Buffer.from('\n') }
  const file = files[k] as unknown as File
  file.layout = 'route.hbs'
  setRouteLayoutContext(file, null, nodes)

  routeIndexes[''] ??= new Set()
  routeIndexes['']?.add('seam-http.js')

  const endpointsKey = `${rootPath}/seam-http-endpoints.ts`
  files[endpointsKey] = { contents: Buffer.from('\n') }
  const endpointFile = files[endpointsKey] as unknown as File
  endpointFile.layout = 'endpoints.hbs'
  setEndpointsLayoutContext(endpointFile, routes)
  routeIndexes['']?.add('seam-http-endpoints.js')

  for (const node of nodes) {
    const path = toFilePath(node.path)
    const name = kebabCase(node.name)

    const k = `${rootPath}/${path}/${name}.ts`
    files[k] = { contents: Buffer.from('\n') }
    const file = files[k] as unknown as File
    file.layout = 'route.hbs'
    setRouteLayoutContext(file, node, nodes)

    routeIndexes[path] ??= new Set()
    routeIndexes[path]?.add(`${name}.js`)

    const pathParts = path.split('/')
    while (pathParts.length > 0) {
      const name = pathParts.pop()
      if (name == null) throw new Error('Unexpected null')
      const path = toFilePath(`/${pathParts.join('/')}`)
      routeIndexes[path] ??= new Set()
      routeIndexes[path]?.add(`${kebabCase(name)}/index.js`)
    }
  }

  for (const [path, routes] of Object.entries(routeIndexes)) {
    const k =
      path === '' ? `${rootPath}/index.ts` : `${rootPath}/${path}/index.ts`
    files[k] = { contents: Buffer.from('\n') }
    const file = files[k] as unknown as File
    file.layout = 'route-index.hbs'
    file.routes = [...routes]
  }
}
