import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'
import {
  SeamHttpRequest,
  type ResponseFromSeamHttpRequest,
} from 'lib/seam/connect/seam-http-request.js'

test('serializes array params when undefined', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  const deviceRequest = seam.devices.get({ device_id: seed.august_device_1 })

  t.true(deviceRequest instanceof SeamHttpRequest)
  t.is(deviceRequest.url, '/devices/get')
  t.deepEqual(deviceRequest.data, {
    device_id: seed.august_device_1,
  })
  t.is(deviceRequest.resourceKey, 'device')
  const device = await deviceRequest
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)

  // Ensure that the type of the response is correct.
  type Expected = ResponseFromSeamHttpRequest<typeof deviceRequest>

  const validDeviceType: Expected['device_type'] = 'august_lock'
  t.truthy(validDeviceType)

  // @ts-expect-error because it's an invalid device type.
  const invalidDeviceType: Expected['device_type'] = 'invalid_device_type'
  t.truthy(invalidDeviceType)
})
