import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import {
  type DevicesGetResponse,
  type DevicesListParams,
  type DevicesListResponse,
  SeamHttp,
  SeamHttpMultiWorkspace,
  type WorkspacesListResponse,
} from '@seamapi/http/connect'

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
        (data: string) =>
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

// UPSTREAM: Fake does not support personal access token.
// https://github.com/seamapi/fake-seam-connect/issues/126
test.failing(
  'SeamHttpMultiWorkspace: fromClient returns instance that uses client',
  async (t) => {
    const { endpoint } = await getTestServer(t)
    const seam = SeamHttpMultiWorkspace.fromClient(
      SeamHttpMultiWorkspace.fromPersonalAccessToken('seam_at_TODO', {
        endpoint,
      }).client,
    )
    const workspaces = await seam.workspaces.list()
    t.true(workspaces.length > 0)
  },
)

// UPSTREAM: Fake does not support personal access token.
// https://github.com/seamapi/fake-seam-connect/issues/126
test.failing(
  'SeamHttpMultiWorkspace: constructor returns instance that uses client',
  async (t) => {
    const { endpoint } = await getTestServer(t)
    const seam = new SeamHttpMultiWorkspace({
      client: SeamHttpMultiWorkspace.fromPersonalAccessToken('seam_at_TODO', {
        endpoint,
      }).client,
    })
    const workspaces = await seam.workspaces.list()
    t.true(workspaces.length > 0)
  },
)

// UPSTREAM: Fake does not support personal access token.
// https://github.com/seamapi/fake-seam-connect/issues/126
test.failing(
  'SeamHttpMultiWorkspace: can use client to make requests',
  async (t) => {
    const { endpoint } = await getTestServer(t)
    const seam = new SeamHttpMultiWorkspace({
      client: SeamHttpMultiWorkspace.fromPersonalAccessToken('seam_at_TODO', {
        endpoint,
      }).client,
    })
    const {
      data: { workspaces },
      status,
    } = await seam.client.get<WorkspacesListResponse>('/workspaces/list')
    t.is(status, 200)
    t.true(workspaces.length > 0)
  },
)
