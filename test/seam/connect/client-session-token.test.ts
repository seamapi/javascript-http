import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import {
  SeamHttp,
  SeamHttpApiError,
  SeamHttpInvalidTokenError,
} from '@seamapi/http/connect'

test('SeamHttp: fromClientSessionToken returns instance authorized with clientSessionToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromClientSessionToken(seed.seam_cst1_token, {
    endpoint,
  })
  const device = await seam.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: constructor returns instance authorized with clientSessionToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = new SeamHttp({
    clientSessionToken: seed.seam_cst1_token,
    endpoint,
  })
  const device = await seam.devices.get({
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

test('SeamHttp: updateClientSessionToken returns instance authorized with a new clientSessionToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromClientSessionToken(seed.seam_cst1_token, {
    endpoint,
  })
  const { token } = await seam.clientSessions.create({
    user_identifier_key: 'some-new-user-identifier-key',
  })

  await seam.updateClientSessionToken(token)
  const devices = await seam.devices.list()
  t.is(devices.length, 0)
})

test('SeamHttp: updateClientSessionToken fails if no existing clientSessionToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  await t.throwsAsync(
    async () => {
      await seam.updateClientSessionToken('seam_cst_123')
    },
    {
      message: /Cannot update/,
    },
  )
})

test('SeamHttp: updateClientSessionToken checks clientSessionToken is authorized', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromClientSessionToken(seed.seam_cst1_token, {
    endpoint,
  })

  const err = await t.throwsAsync(
    async () => {
      await seam.updateClientSessionToken('seam_cst_123')
    },
    {
      instanceOf: SeamHttpApiError,
    },
  )
  t.is(err?.statusCode, 401)
  t.is(err?.code, 'unauthorized')
})
