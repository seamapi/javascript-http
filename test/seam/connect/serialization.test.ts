import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { type DevicesListResponse, SeamHttp } from '@seamapi/http/connect'

test('serializes array params when undefined', async (t) => {
  const { seed, endpoint, db } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const devices = await seam.devices.list({
    device_ids: undefined,
  })
  t.is(devices.length, db.devices.length)
})

test('serializes array params when empty', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const devices = await seam.devices.list({
    device_ids: [],
  })
  t.is(devices.length, 0)
})

test('serializes array params when non-empty', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const devices = await seam.devices.list({
    device_ids: [seed.august_device_1, seed.ecobee_device_1],
  })
  t.is(devices.length, 2)
  t.true(devices.some((d) => d.device_id === seed.august_device_1))
  t.true(devices.some((d) => d.device_id === seed.ecobee_device_1))
})

test('serializes array params when undefined and explicitly using get', async (t) => {
  const { seed, endpoint, db } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const { data } = await seam.client.get<DevicesListResponse>('/devices/list', {
    params: {
      device_ids: undefined,
    },
  })
  const devices = data?.devices
  t.is(devices.length, db.devices.length)
})

test('serializes array params when empty and explicitly using get', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const { data } = await seam.client.get<DevicesListResponse>('/devices/list', {
    params: {
      device_ids: [],
    },
  })
  const devices = data?.devices
  t.is(devices.length, 0)
})

test('serializes array params when non-empty and explicitly using get', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const { data } = await seam.client.get<DevicesListResponse>('/devices/list', {
    params: {
      device_ids: [seed.august_device_1, seed.ecobee_device_1],
    },
  })
  const devices = data?.devices
  t.is(devices.length, 2)
  t.true(devices.some((d) => d.device_id === seed.august_device_1))
  t.true(devices.some((d) => d.device_id === seed.ecobee_device_1))
})
