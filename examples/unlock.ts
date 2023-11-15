import type { Builder, Command, Describe } from 'landlubber'

import {
  isSeamActionAttemptFailedError,
  isSeamActionAttemptTimeoutError,
  type LocksUnlockDoorResponse,
} from '@seamapi/http/connect'

import type { Handler } from './index.js'

interface Options {
  deviceId: string
}

export const command: Command = 'unlock deviceId'

export const describe: Describe = 'Unlock a door'

export const builder: Builder = {
  deviceId: {
    type: 'string',
    describe: 'Device id of lock to unlock',
  },
}

export const handler: Handler<Options> = async ({ deviceId, seam, logger }) => {
  try {
    const actionAttempt = await seam.locks.unlockDoor(
      {
        device_id: deviceId,
      },
      { waitForActionAttempt: true },
    )
    logger.info({ actionAttempt }, 'unlocked')
  } catch (err: unknown) {
    if (isSeamActionAttemptFailedError<UnlockDoorActionAttempt>(err)) {
      logger.info({ err }, 'Could not unlock the door')
      return
    }

    if (isSeamActionAttemptTimeoutError<UnlockDoorActionAttempt>(err)) {
      logger.info({ err }, 'Door took too long to unlock')
      return
    }

    throw err
  }
}

type UnlockDoorActionAttempt = LocksUnlockDoorResponse['action_attempt']
