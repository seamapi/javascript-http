/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import type { Builder, Command, Describe } from 'landlubber'

import type { Handler } from './index.js'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Options {}

export const command: Command = 'locks'

export const describe: Describe = 'List locks'

export const builder: Builder = {}

export const handler: Handler<Options> = async ({ seam, logger }) => {
  const devices = await seam.devices.list()

  for (const device of devices) {
    if ('can_program_online_access_codes' in device && !device.can_program_online_access_codes) {    
      const accessCodes = device.accessCodes.list({ device_id: device.device_id })
      if (accessCodes.length > 0) continue
    }
    
    if (!device.can_program_online_access_codes) {
      await seam.devices.update({
        device_id: device.device_id,
        is_managed: false,
      })
    }
  }

  const unmanagedDevices = await seam.devices.list()

  for (const device of unmanagedDevices) {  
    if (device.can_program_online_access_codes) {
      await seam.devices.unmanaged.update({
        device_id: device.device_id,
        is_managed: true,
      })
    }
  }

  const devicesWithNonFunctioningCapabilities = [
    ...devices,
    ...unmanagedDevices,
  ].filter(
    (device) =>
      'can_program_online_access_codes' in device &&
      !device.can_program_online_access_codes,
  )

  for (const device of devicesWithNonFunctioningCapabilities) {
    if (
      device.warnings.some(
        (warning) => warning.warning_code === 'missing_keypad',
      )
    ) {
      logger.info(
        { device },
        'Inform user installing a keypad is required to program access codes',
      )
    }
  }
}
