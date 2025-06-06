import type { Blueprint, Route } from '@seamapi/blueprint'
import { kebabCase, pascalCase } from 'change-case'
import type Metalsmith from 'metalsmith'

interface Metadata {
  blueprint: Blueprint
}

type File = RouteLayoutContext & { layout: string }

const rootPath = 'src/lib/seam/connect/routes'

export const connect = (
  files: Metalsmith.Files,
  metalsmith: Metalsmith,
): void => {
  const metadata = metalsmith.metadata() as Metadata
  const { blueprint } = metadata

  for (const route of Object.values(blueprint.routes ?? {})) {
    const k = `${rootPath}/${route.path.split('/').map(p => kebabCase(p)).join('/')}.ts`
    files[k] = { contents: Buffer.from('\n') }
    const file = files[k] as unknown as File
    file.layout = 'route.hbs'
    setRouteLayoutContext(file, route, blueprint)
  }
}

interface RouteLayoutContext {
  routeName: string
}

const setRouteLayoutContext = (
  file: Partial<RouteLayoutContext>,
  route: Route,
  _blueprint: Blueprint,
): void => {
  file.routeName = pascalCase(route.name)
}
