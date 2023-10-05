import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

test('SeamHttp: fromClient returns instance that uses client', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const client = SeamHttp.fromClient(
    SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint }).client,
  )
  const device = await client.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: constructor returns instance that uses client', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const client = new SeamHttp({
    client: SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint }).client,
  })
  const device = await client.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})
