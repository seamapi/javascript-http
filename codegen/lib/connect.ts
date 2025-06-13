import type { Blueprint } from '@seamapi/blueprint'
import { kebabCase } from 'change-case'
import type Metalsmith from 'metalsmith'

import {
  type RouteIndexLayoutContext,
  type RouteLayoutContext,
  setRouteLayoutContext,
} from './layouts/route.js'

interface Metadata {
  blueprint: Blueprint
}

type File = RouteLayoutContext & RouteIndexLayoutContext & { layout: string }

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

  const rootRouteKey = `${rootPath}/seam-http.ts`
  files[rootRouteKey] = { contents: Buffer.from('\n') }
  const file = files[rootRouteKey] as unknown as File
  file.layout = 'route.hbs'
  setRouteLayoutContext(file, null, nodes)

  routeIndexes[''] ??= new Set()
  routeIndexes['']?.add('seam-http.js')

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

const toFilePath = (path: string): string =>
  path
    .slice(1)
    .split('/')
    .map((p) => kebabCase(p))
    .join('/')
