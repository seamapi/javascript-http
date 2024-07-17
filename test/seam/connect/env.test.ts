import { env } from 'node:process'

import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp, SeamHttpInvalidOptionsError } from '@seamapi/http/connect'

/*
 * Tests in this file must run serially to ensure a clean environment for each test.
 */
const cleanupEnv = (): void => {
  delete env.SEAM_API_KEY
  delete env.SEAM_ENDPOINT
  delete env.SEAM_API_URL
}
test.afterEach(cleanupEnv)
test.beforeEach(cleanupEnv)

test.serial(
  'SeamHttp: constructor uses SEAM_API_KEY environment variable',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_KEY = seed.seam_apikey1_token
    const seam = new SeamHttp({ endpoint })
    const device = await seam.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test.serial(
  'SeamHttp: constructor checks for SEAM_API_KEY environment variable',
  (t) => {
    t.throws(() => new SeamHttp(), {
      instanceOf: SeamHttpInvalidOptionsError,
      message: /SEAM_API_KEY/,
    })
  },
)

test.serial(
  'SeamHttp: apiKey option overrides environment variables',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_KEY = 'some-invalid-api-key-1'
    const seam = new SeamHttp({ apiKey: seed.seam_apikey1_token, endpoint })
    const device = await seam.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test.serial(
  'SeamHttp: apiKey option as first argument overrides environment variables',
  (t) => {
    env.SEAM_API_KEY = 'some-invalid-api-key-2'
    const seam = new SeamHttp('seam_apikey_token')
    t.truthy(seam)
  },
)

test.serial(
  'SeamHttp: constructor uses SEAM_API_KEY environment variable when passed no argument',
  (t) => {
    env.SEAM_API_KEY = 'seam_apikey_token'
    const seam = new SeamHttp()
    t.truthy(seam)
  },
)

test.serial(
  'SeamHttp: constructor requires SEAM_API_KEY when passed no argument',
  (t) => {
    t.throws(() => new SeamHttp(), {
      instanceOf: SeamHttpInvalidOptionsError,
      message: /apiKey/,
    })
  },
)

test.serial(
  'SeamHttp: SEAM_ENDPOINT environment variable is used first',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_URL = 'https://example.com'
    env.SEAM_ENDPOINT = endpoint
    const seam = new SeamHttp({ apiKey: seed.seam_apikey1_token })
    const device = await seam.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test.serial(
  'SeamHttp: SEAM_API_URL environment variable is used as fallback',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_URL = endpoint
    const seam = new SeamHttp({ apiKey: seed.seam_apikey1_token })
    const device = await seam.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test.serial(
  'SeamHttp: endpoint option overrides environment variables',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_URL = 'https://example.com'
    env.SEAM_ENDPOINT = 'https://example.com'
    const seam = new SeamHttp({ apiKey: seed.seam_apikey1_token, endpoint })
    const device = await seam.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test.serial(
  'SeamHttp: SEAM_ENDPOINT environment variable is used with fromApiKey',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_URL = 'https://example.com'
    env.SEAM_ENDPOINT = endpoint
    const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token)
    const device = await seam.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test.serial(
  'SeamHttp: constructor ignores SEAM_API_KEY environment variable if used with clientSessionToken',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_KEY = 'some-invalid-api-key-3'
    const seam = new SeamHttp({
      clientSessionToken: seed.seam_cst1_token,
      endpoint,
    })
    const device = await seam.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test.serial(
  'SeamHttp: SEAM_API_KEY environment variable is ignored with fromClientSessionToken',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_KEY = seed.seam_apikey1_token
    const seam = SeamHttp.fromClientSessionToken(seed.seam_cst1_token, {
      endpoint,
    })
    const device = await seam.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test.serial(
  'SeamHttp: SEAM_API_KEY environment variable is ignored with fromPublishableKey',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_KEY = seed.seam_apikey1_token
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
  },
)

// UPSTREAM: Fake does not support JWT.
// https://github.com/seamapi/fake-seam-connect/issues/124
test.serial.failing(
  'SeamHttp: SEAM_API_KEY environment variable is ignored with fromConsoleSessionToken',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_KEY = seed.seam_apikey1_token
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

// UPSTREAM: Fake does not support personal access token.
// https://github.com/seamapi/fake-seam-connect/issues/126
test.serial.failing(
  'SeamHttp: SEAM_API_KEY environment variable is ignored with personalAccessToken',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_KEY = seed.seam_apikey1_token
    const seam = SeamHttp.fromPersonalAccessToken(
      'seam_at_TODO',
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

test.serial(
  'SeamHttp: SEAM_ENDPOINT environment variable is used with fromPublishableKey',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_ENDPOINT = endpoint
    const seam = await SeamHttp.fromPublishableKey(
      seed.seam_pk1_token,
      seed.john_user_identifier_key,
    )
    const device = await seam.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test.serial(
  'SeamHttp: SEAM_ENDPOINT environment variable is used with fromClientSessionToken',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_URL = 'https://example.com'
    env.SEAM_ENDPOINT = endpoint
    const seam = SeamHttp.fromClientSessionToken(seed.seam_cst1_token)
    const device = await seam.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)
