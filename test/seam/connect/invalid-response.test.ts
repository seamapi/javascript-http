import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'
import nock from 'nock'

import {
  isSeamHttpInvalidResponseError,
  SeamHttp,
  SeamHttpInvalidResponseError,
} from '@seamapi/http/connect'

const jsonHeaders = { 'Content-Type': 'application/json' }

test('SeamHttpRequest: throws for a success response missing the response key', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  nock(endpoint).get('/devices/get').query(true).reply(200, {})

  const err = await t.throwsAsync(
    async () => await seam.devices.get({ device_id: seed.august_device_1 }),
    {
      instanceOf: SeamHttpInvalidResponseError,
      message:
        'Seam returned an invalid response for /devices/get: expected "device", which the response does not contain',
    },
  )

  t.true(isSeamHttpInvalidResponseError(err))
  t.is(err?.path, '/devices/get')
  t.is(err?.responseKey, 'device')
})

test('SeamHttpRequest: throws for a success response that is not an object', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  nock(endpoint)
    .get('/devices/get')
    .query(true)
    .reply(200, JSON.stringify('device'), jsonHeaders)

  await t.throwsAsync(
    async () => await seam.devices.get({ device_id: seed.august_device_1 }),
    {
      instanceOf: SeamHttpInvalidResponseError,
      message:
        'Seam returned an invalid response for /devices/get: expected "device", got string instead of a response object',
    },
  )
})

test('SeamHttpRequest: throws for a null success response', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  nock(endpoint)
    .get('/devices/get')
    .query(true)
    .reply(200, JSON.stringify(null), jsonHeaders)

  await t.throwsAsync(
    async () => await seam.devices.get({ device_id: seed.august_device_1 }),
    {
      instanceOf: SeamHttpInvalidResponseError,
      message:
        'Seam returned an invalid response for /devices/get: expected "device", got null instead of a response object',
    },
  )
})

test('SeamHttpRequest: throws for a malformed action attempt response', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  nock(endpoint).post('/locks/unlock_door').reply(200, {})

  await t.throwsAsync(
    async () =>
      await seam.locks.unlockDoor({ device_id: seed.august_device_1 }),
    {
      instanceOf: SeamHttpInvalidResponseError,
      message:
        'Seam returned an invalid response for /locks/unlock_door: expected "action_attempt", which the response does not contain',
    },
  )
})

test('SeamPaginator: throws for a success response where the response key is not a list', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  nock(endpoint)
    .get('/devices/list')
    .reply(200, {
      devices: 'device-1',
      pagination: {
        has_next_page: false,
        next_page_cursor: null,
        next_page_url: null,
      },
    })

  const pages = seam.createPaginator(seam.devices.list())

  await t.throwsAsync(async () => await pages.firstPage(), {
    instanceOf: SeamHttpInvalidResponseError,
    message:
      'Seam returned an invalid response for /devices/list: expected "devices", got string instead of a list',
  })
})

test('SeamPaginator: throws for a success response missing the pagination object', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  nock(endpoint).get('/devices/list').reply(200, { devices: [] })

  const pages = seam.createPaginator(seam.devices.list())

  await t.throwsAsync(async () => await pages.firstPage(), {
    instanceOf: SeamHttpInvalidResponseError,
    message:
      'Seam returned an invalid response for /devices/list: expected "pagination", which the response does not contain',
  })
})

test('SeamPaginator: throws for a success response with a non-object pagination value', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  nock(endpoint)
    .get('/devices/list')
    .reply(200, { devices: [], pagination: 'none' })

  const pages = seam.createPaginator(seam.devices.list())

  await t.throwsAsync(async () => await pages.firstPage(), {
    instanceOf: SeamHttpInvalidResponseError,
    message:
      'Seam returned an invalid response for /devices/list: expected "pagination", got string instead of a pagination object',
  })
})
