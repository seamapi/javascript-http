import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import layouts from '@metalsmith/layouts'
import { blueprint, getHandlebarsPartials } from '@seamapi/smith'
import * as types from '@seamapi/types/connect'
import { deleteAsync } from 'del'
import Metalsmith from 'metalsmith'

import { connect, helpers } from './lib/index.js'

const rootDir = dirname(fileURLToPath(import.meta.url))
const projectDir = resolve(rootDir, '..')

// Copy route-types.ts from @seamapi/types into the source tree so consumers
// do not need @seamapi/types as a peer dependency.
const routeTypesSrc = resolve(
  projectDir,
  'node_modules/@seamapi/types/src/lib/seam/connect/route-types.ts',
)
const routeTypesDest = resolve(
  projectDir,
  'src/lib/seam/connect/route-types.ts',
)
const header = `// This file is auto-generated during codegen from @seamapi/types.\n// Do not edit manually.\n\n`
writeFileSync(routeTypesDest, header + readFileSync(routeTypesSrc, 'utf-8'))

await Promise.all([deleteAsync('./src/lib/seam/connect/routes')])

const partials = await getHandlebarsPartials(`${rootDir}/layouts/partials`)

Metalsmith(rootDir)
  .source('./content')
  .destination('../')
  .clean(false)
  .use(blueprint({ types }))
  .use(connect)
  .use(
    layouts({
      default: 'default.hbs',
      engineOptions: {
        noEscape: true,
        helpers,
        partials,
      },
    }),
  )
  .build((err) => {
    if (err != null) throw err
  })
