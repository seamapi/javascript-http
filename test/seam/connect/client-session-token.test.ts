import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

import { SeamHttpInvalidTokenError } from 'lib/seam/connect/auth.js'

test('SeamHttp: fromClientSessionToken returns instance authorized with clientSessionToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const client = SeamHttp.fromClientSessionToken(seed.seam_cst1_token, {
    endpoint,
  })
  const device = await client.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: constructor returns instance authorized with clientSessionToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const client = new SeamHttp({
    clientSessionToken: seed.seam_cst1_token,
    endpoint,
  })
  const device = await client.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: checks clientSessionToken format', (t) => {
  t.throws(() => SeamHttp.fromClientSessionToken('some-invalid-key-format'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Unknown/,
  })
  t.throws(() => SeamHttp.fromClientSessionToken('seam_apikey_token'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Unknown/,
  })
  t.throws(() => SeamHttp.fromClientSessionToken('ey'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /JWT/,
  })
  t.throws(() => SeamHttp.fromClientSessionToken('seam_at'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Access Token/,
  })
})
