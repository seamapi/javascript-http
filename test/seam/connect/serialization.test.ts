import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

test('serializes array params when undefined', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const client = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const devices = await client.devices.list({
    device_ids: undefined,
  })
  t.is(devices.length, 4)
})

test('serializes array params when empty', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const client = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const devices = await client.devices.list({
    device_ids: [],
  })
  t.is(devices.length, 0)
})

test('serializes array params when non-empty', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const client = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const devices = await client.devices.list({
    device_ids: [seed.august_device_1, seed.ecobee_device_1],
  })
  t.is(devices.length, 2)
  t.true(devices.some((d) => d.device_id === seed.august_device_1))
  t.true(devices.some((d) => d.device_id === seed.ecobee_device_1))
})
