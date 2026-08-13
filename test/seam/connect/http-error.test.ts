import test from 'ava'
import { AxiosError, AxiosHeaders } from 'axios'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import {
  errorInterceptor,
  SeamHttp,
  SeamHttpApiError,
  SeamHttpInvalidInputError,
  SeamHttpUnauthorizedError,
} from '@seamapi/http/connect'

test('SeamHttp: preserves AxiosError for JSON-shaped non-JSON response', async (t) => {
  const data = {
    error: {
      type: 'bad_gateway',
      message: 'A middlebox returned this error page',
    },
  }
  const err = new AxiosError(
    'Request failed with status code 502',
    AxiosError.ERR_BAD_RESPONSE,
    undefined,
    undefined,
    {
      data,
      status: 502,
      statusText: 'Bad Gateway',
      headers: new AxiosHeaders({ 'content-type': 'text/html; charset=utf-8' }),
      config: { headers: new AxiosHeaders() },
    },
  )

  const thrown = await t.throwsAsync(errorInterceptor(err), {
    instanceOf: AxiosError,
  })

  t.is(thrown, err)
  t.deepEqual(thrown.response?.data, data)
})

test('SeamHttp: throws AxiosError on non-standard response', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    axiosRetryOptions: {
      retries: 0,
    },
  })

  await seam.client.post('/_fake/simulate_workspace_outage', {
    workspace_id: seed.seed_workspace_1,
    routes: ['/devices/list'],
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
  t.true(err?.requestId?.startsWith('request'))
})

test('SeamHttp: throws SeamHttpApiError on standard error response', async (t) => {
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
  t.true(err?.requestId?.startsWith('request'))
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
  t.true(err?.requestId?.startsWith('request'))
  t.deepEqual(err?.getValidationErrorMessages('device_ids'), [
    'Expected array, received number',
  ])
})
