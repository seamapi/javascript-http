import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp, SeamHttpInvalidTokenError } from '@seamapi/http/connect'

test('SeamHttp: fromApiKey returns instance authorized with apiKey', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const device = await seam.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: constructor returns instance authorized with apiKey', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = new SeamHttp({ apiKey: seed.seam_apikey1_token, endpoint })
  const device = await seam.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: constructor interprets single string argument as apiKey', (t) => {
  const seam = new SeamHttp('seam_apikey_token')
  t.truthy(seam)
  t.throws(() => new SeamHttp('some-invalid-key-format'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /apiKey/,
  })
})

test('SeamHttp: checks apiKey format', (t) => {
  t.throws(() => SeamHttp.fromApiKey('some-invalid-key-format'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Unknown/,
  })
  t.throws(() => SeamHttp.fromApiKey('ey'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /JWT/,
  })
  t.throws(() => SeamHttp.fromApiKey('seam_cst_token'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Client Session Token/,
  })
  t.throws(() => SeamHttp.fromApiKey('seam_at'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Access Token/,
  })
})
