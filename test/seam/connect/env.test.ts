import { env } from 'node:process'

import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

import { SeamHttpInvalidOptionsError } from 'lib/seam/connect/client-options.js'

/*
 * Tests in this file must run serially to ensure a clean environment for each test.
 */
test.afterEach(() => {
  delete env.SEAM_API_KEY
  delete env.SEAM_ENDPOINT
  delete env.SEAM_API_URL
})

test.serial(
  'SeamHttp: constructor uses SEAM_API_KEY environment variable',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_KEY = seed.seam_apikey1_token
    const client = new SeamHttp({ endpoint })
    const device = await client.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test.serial(
  'SeamHttp: apiKey option overrides environment variables',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    env.SEAM_API_KEY = 'some-invalid-api-key'
    const client = new SeamHttp({ apiKey: seed.seam_apikey1_token, endpoint })
    const device = await client.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)

test.serial(
  'SeamHttp: apiKey option as first argument overrides environment variables',
  (t) => {
    env.SEAM_API_KEY = 'some-invalid-api-key'
    const client = new SeamHttp('seam_apikey_token')
    t.truthy(client)
  },
)

test.serial(
  'SeamHttp: constructor uses SEAM_API_KEY environment variable when passed no argument',
  (t) => {
    env.SEAM_API_KEY = 'seam_apikey_token'
    const client = new SeamHttp()
    t.truthy(client)
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
  'SeamHttp: constructor throws if SEAM_API_KEY environment variable is used with clientSessionToken',
  (t) => {
    env.SEAM_API_KEY = 'seam_apikey_token'
    t.throws(() => new SeamHttp({ clientSessionToken: 'seam_cst1_token' }), {
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
    const client = new SeamHttp({ apiKey: seed.seam_apikey1_token })
    const device = await client.devices.get({
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
    const client = new SeamHttp({ apiKey: seed.seam_apikey1_token })
    const device = await client.devices.get({
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
    const client = new SeamHttp({ apiKey: seed.seam_apikey1_token, endpoint })
    const device = await client.devices.get({
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
    const client = SeamHttp.fromApiKey(seed.seam_apikey1_token)
    const device = await client.devices.get({
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
    const client = SeamHttp.fromClientSessionToken(seed.seam_cst1_token)
    const device = await client.devices.get({
      device_id: seed.august_device_1,
    })
    t.is(device.workspace_id, seed.seed_workspace_1)
    t.is(device.device_id, seed.august_device_1)
  },
)
