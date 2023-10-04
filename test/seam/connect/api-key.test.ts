import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

test('SeamHttp: fromApiKey', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const client = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const device = await client.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})
