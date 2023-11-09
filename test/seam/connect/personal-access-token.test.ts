import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

import { SeamHttpInvalidTokenError } from 'lib/seam/connect/auth.js'

// UPSTREAM: Fake does not support personal access token.
// https://github.com/seamapi/fake-seam-connect/issues/126
test.failing(
  'SeamHttp: fromPersonalAccessToken returns instance authorized with personalAccessToken',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    const seam = SeamHttp.fromPersonalAccessToken(
      'at_TODO',
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

// UPSTREAM: Fake does not support personal access token.
// https://github.com/seamapi/fake-seam-connect/issues/126
test.failing(
  'SeamHttp: constructor returns instance authorized with personalAccessToken',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    const seam = new SeamHttp({
      personalAccessToken: 'at_TODO',
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
