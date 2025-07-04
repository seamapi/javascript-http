import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import {
  SeamHttp,
  SeamHttpInvalidTokenError,
  SeamHttpWithoutWorkspace,
} from '@seamapi/http/connect'

test('SeamHttp: fromPersonalAccessToken returns instance authorized with personalAccessToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromPersonalAccessToken(
    seed.seam_at1_token,
    seed.seed_workspace_1,
    {
      endpoint,
    },
  )
  const device = await seam.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: constructor returns instance authorized with personalAccessToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = new SeamHttp({
    personalAccessToken: seed.seam_at1_token,
    workspaceId: seed.seed_workspace_1,
    endpoint,
  })
  const device = await seam.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: checks personalAccessToken format', (t) => {
  const workspaceId = 'e4203e37-e569-4a5a-bfb7-e3e8de66161d'
  t.throws(
    () =>
      SeamHttp.fromPersonalAccessToken('some-invalid-key-format', workspaceId),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(
    () => SeamHttp.fromPersonalAccessToken('seam_apikey_token', workspaceId),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(() => SeamHttp.fromPersonalAccessToken('seam_cst', workspaceId), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Client Session Token/,
  })
  t.throws(() => SeamHttp.fromPersonalAccessToken('ey', workspaceId), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /JWT/,
  })
})

test('SeamHttpWithoutWorkspace: fromPersonalAccessToken returns instance authorized with personalAccessToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttpWithoutWorkspace.fromPersonalAccessToken(
    seed.seam_at1_token,
    {
      endpoint,
    },
  )
  const workspaces = await seam.workspaces.list()
  t.true(workspaces.length > 0)
})

test('SeamHttpWithoutWorkspace: constructor returns instance authorized with personalAccessToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = new SeamHttpWithoutWorkspace({
    personalAccessToken: seed.seam_at1_token,
    endpoint,
  })
  const workspaces = await seam.workspaces.list()
  t.true(workspaces.length > 0)
})

test('SeamHttpWithoutWorkspace: checks personalAccessToken format', (t) => {
  t.throws(
    () =>
      SeamHttpWithoutWorkspace.fromPersonalAccessToken(
        'some-invalid-key-format',
      ),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(
    () => SeamHttpWithoutWorkspace.fromPersonalAccessToken('seam_apikey_token'),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(() => SeamHttpWithoutWorkspace.fromPersonalAccessToken('seam_cst'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Client Session Token/,
  })
  t.throws(() => SeamHttpWithoutWorkspace.fromPersonalAccessToken('ey'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /JWT/,
  })
})
