import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

test('SeamHttp: fromClient returns instance that uses client', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromClient(
    SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint }).client,
  )
  const device = await seam.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: constructor returns instance that uses client', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = new SeamHttp({
    client: SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint }).client,
  })
  const device = await seam.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: merges axiosOptions when creating client', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    axiosOptions: {
      transformResponse: [
        (data) =>
          JSON.parse(
            data.replaceAll(seed.august_device_1, 'transformed-device-id'),
          ),
      ],
    },
  })
  const device = await seam.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, 'transformed-device-id')
})

test('SeamHttp: merges axios headers when creating client', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey('seam_invalidapikey_token', {
    endpoint,
    axiosOptions: {
      headers: {
        Authorization: `Bearer ${seed.seam_apikey1_token}`,
      },
    },
  })
  const device = await seam.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})
