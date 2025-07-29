#!/usr/bin/env tsx

import landlubber, {
  type DefaultContext,
  defaultMiddleware,
  type EmptyOptions,
  type Handler as DefaultHandler,
  type MiddlewareFunction,
} from 'landlubber'

import { SeamHttp } from '@seamapi/http'

import * as locks from './locks.js'
import * as unlock from './unlock.js'
import * as workspace from './workspace.js'

export type Handler<Options = EmptyOptions> = DefaultHandler<Options, Context>

type Context = DefaultContext & ClientContext

interface ClientContext {
  seam: SeamHttp
}

const commands = [locks, unlock, workspace]

const createAppContext: MiddlewareFunction = async (argv) => {
  argv['seam'] = new SeamHttp()
}

const middleware = [...defaultMiddleware, createAppContext]

await landlubber<Context>(commands, { middleware }).parse()
