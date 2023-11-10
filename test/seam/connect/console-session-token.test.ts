import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import {
  SeamHttp,
  SeamHttpInvalidTokenError,
  SeamHttpMultiWorkspace,
} from '@seamapi/http/connect'

// UPSTREAM: Fake does not support JWT.
// https://github.com/seamapi/fake-seam-connect/issues/124
test.failing(
  'SeamHttp: fromConsoleSessionToken returns instance authorized with consoleSessionToken',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    const seam = SeamHttp.fromConsoleSessionToken(
      'ey_TODO',
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
  },
)

// UPSTREAM: Fake does not support JWT.
// https://github.com/seamapi/fake-seam-connect/issues/124
test.failing(
  'SeamHttp: constructor returns instance authorized with consoleSessionToken',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    const seam = new SeamHttp({
      consoleSessionToken: 'ey_TODO',
      workspaceId: seed.seed_workspace_1,
      endpoint,
    })
    const device = await seam.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test('SeamHttp: checks consoleSessionToken format', (t) => {
  const workspaceId = 'e4203e37-e569-4a5a-bfb7-e3e8de66161d'
  t.throws(
    () =>
      SeamHttp.fromConsoleSessionToken('some-invalid-key-format', workspaceId),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(
    () => SeamHttp.fromConsoleSessionToken('seam_apikey_token', workspaceId),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(() => SeamHttp.fromConsoleSessionToken('seam_cst', workspaceId), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Client Session Token/,
  })
  t.throws(() => SeamHttp.fromConsoleSessionToken('seam_at', workspaceId), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Access Token/,
  })
})

// UPSTREAM: Fake does not support JWT.
// https://github.com/seamapi/fake-seam-connect/issues/124
test.failing(
  'SeamHttpMultiWorkspace: fromConsoleSessionToken returns instance authorized with consoleSessionToken',
  async (t) => {
    const { endpoint } = await getTestServer(t)
    const seam = SeamHttpMultiWorkspace.fromConsoleSessionToken('ey_TODO', {
      endpoint,
    })
    const workspaces = await seam.workspaces.list()
    t.true(workspaces.length > 0)
  },
)

// UPSTREAM: Fake does not support JWT.
// https://github.com/seamapi/fake-seam-connect/issues/124
test.failing(
  'SeamHttpMultiWorkspace: constructor returns instance authorized with consoleSessionToken',
  async (t) => {
    const { endpoint } = await getTestServer(t)
    const seam = new SeamHttpMultiWorkspace({
      consoleSessionToken: 'ey_TODO',
      endpoint,
    })
    const workspaces = await seam.workspaces.list()
    t.true(workspaces.length > 0)
  },
)

test('SeamHttpMultiWorkspace: checks consoleSessionToken format', (t) => {
  t.throws(
    () =>
      SeamHttpMultiWorkspace.fromConsoleSessionToken('some-invalid-key-format'),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(
    () => SeamHttpMultiWorkspace.fromConsoleSessionToken('seam_apikey_token'),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(() => SeamHttpMultiWorkspace.fromConsoleSessionToken('seam_cst'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Client Session Token/,
  })
  t.throws(() => SeamHttpMultiWorkspace.fromConsoleSessionToken('seam_at'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Access Token/,
  })
})
