import type { Builder, Command, Describe } from 'landlubber'

import type { Handler } from './index.js'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Options {}

export const command: Command = 'locks'

export const describe: Describe = 'List locks'

export const builder: Builder = {}

export const handler: Handler<Options> = async ({ seam, logger }) => {
  const devices = await seam.locks.list()
  logger.info({ devices }, 'locks')
}
