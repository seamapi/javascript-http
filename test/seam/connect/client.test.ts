import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

import type {
  DevicesGetResponse,
  DevicesListParams,
  DevicesListResponse,
} from 'lib/seam/connect/routes/devices.js'

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

test('SeamHttp: can use client to make requests', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = new SeamHttp({
    client: SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint }).client,
  })
  const {
    data: { device },
    status,
  } = await seam.client.get<DevicesGetResponse>('/devices/get', {
    params: { device_id: seed.august_device_1 },
  })
  t.is(status, 200)
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: client serializes array params', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = new SeamHttp({
    client: SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint }).client,
  })
  const params: DevicesListParams = {
    device_ids: [seed.august_device_1],
  }
  const {
    data: { devices },
    status,
  } = await seam.client.get<DevicesListResponse>('/devices/list', {
    params,
  })
  t.is(status, 200)
  t.is(devices.length, 1)
  const [device] = devices
  t.is(device?.workspace_id, seed.seed_workspace_1)
  t.is(device?.device_id, seed.august_device_1)
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
