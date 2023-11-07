import test from 'ava'
import { AxiosError } from 'axios'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import {
  SeamHttp,
  SeamHttpApiError,
  SeamHttpInvalidInputError,
} from '@seamapi/http/connect'

import { SeamHttpUnauthorizedError } from 'lib/seam/connect/unauthorized-error.js'

test('SeamHttp: throws AxiosError on non-json response', async (t) => {
  const { seed, endpoint, db } = await getTestServer(t)

  db.simulateWorkspaceOutage(seed.seed_workspace_1, {
    routes: ['/devices/list'],
  })

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    axiosRetryOptions: {
      retries: 0,
    },
  })

  const err = await t.throwsAsync(async () => await seam.devices.list(), {
    instanceOf: AxiosError,
  })

  t.is(err?.response?.status, 503)
})

test('SeamHttp: throws SeamHttpUnauthorizedError if unauthorized', async (t) => {
  const { endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey('seam_invalid_api_key', {
    endpoint,
    axiosRetryOptions: {
      retries: 0,
    },
  })

  const err = await t.throwsAsync(async () => await seam.devices.list(), {
    instanceOf: SeamHttpUnauthorizedError,
  })

  t.is(err?.statusCode, 401)
  t.is(err?.code, 'unauthorized')
  t.is(err?.requestId, 'request1')
})

test('SeamHttp: throws SeamHttpApiError on json response', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    axiosRetryOptions: {
      retries: 0,
    },
  })

  const err = await t.throwsAsync(
    async () => await seam.devices.get({ device_id: 'unknown-device' }),
    {
      instanceOf: SeamHttpApiError,
    },
  )

  t.is(err?.statusCode, 404)
  t.is(err?.code, 'device_not_found')
  t.is(err?.requestId, 'request1')
})

test('SeamHttp: throws SeamHttpInvalidInputError on invalid input', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    axiosRetryOptions: {
      retries: 0,
    },
  })

  const err = await t.throwsAsync(
    async () =>
      await seam.devices.client.post('/devices/list', { device_ids: 4242 }),
    {
      instanceOf: SeamHttpInvalidInputError,
    },
  )

  t.is(err?.statusCode, 400)
  t.is(err?.code, 'invalid_input')
  t.is(err?.requestId, 'request1')
})
