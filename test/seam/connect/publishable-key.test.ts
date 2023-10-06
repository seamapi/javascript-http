import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

import { SeamHttpInvalidTokenError } from 'lib/seam/connect/auth.js'

test('SeamHttp: fromPublishableKey returns instance authorized with clientSessionToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = await SeamHttp.fromPublishableKey(
    seed.seam_pk1_token,
    seed.john_user_identifier_key,
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

test('SeamHttp: checks publishableKey format', async (t) => {
  await t.throwsAsync(
    async () =>
      await SeamHttp.fromPublishableKey(
        'some-invalid-key-format',
        'some-user-identifier-key',
      ),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  await t.throwsAsync(
    async () =>
      await SeamHttp.fromPublishableKey(
        'seam_apikey_token',
        'some-user-identifier-key',
      ),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  await t.throwsAsync(
    async () =>
      await SeamHttp.fromPublishableKey('seam_cst', 'some-user-identifier-key'),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Client Session Token/,
    },
  )
  await t.throwsAsync(
    async () =>
      await SeamHttp.fromPublishableKey('ey', 'some-user-identifier-key'),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /JWT/,
    },
  )
  await t.throwsAsync(
    async () =>
      await SeamHttp.fromPublishableKey('seam_at', 'some-user-identifier-key'),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Access Token/,
    },
  )
})
