import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import layouts from '@metalsmith/layouts'
import { blueprint, getHandlebarsPartials } from '@seamapi/smith'
import * as types from '@seamapi/types/connect'
import { deleteAsync } from 'del'
import Metalsmith from 'metalsmith'

import { connect, helpers } from './lib/index.js'

const rootDir = dirname(fileURLToPath(import.meta.url))

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
