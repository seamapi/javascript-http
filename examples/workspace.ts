import type { Builder, Command, Describe } from 'landlubber'

import type { Handler } from './index.js'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Options {}

export const command: Command = 'workspace'

export const describe: Describe = 'Get workspace'

export const builder: Builder = {}

export const handler: Handler<Options> = async ({ seam, logger }) => {
  const workspace = await seam.workspaces.get()
  logger.info({ workspace }, 'workspace')
}
