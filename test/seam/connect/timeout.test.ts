import test from 'ava'
import { AxiosError } from 'axios'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

test('SeamHttp: times out requests after 30s by default', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  t.is(seam.client.defaults.timeout, 30_000)
})

test('SeamHttp: timeout option overrides the default', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    timeout: 60_000,
  })
  t.is(seam.client.defaults.timeout, 60_000)
})

test('SeamHttp: axiosOptions timeout overrides the timeout option', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    timeout: 60_000,
    axiosOptions: { timeout: 1_000 },
  })
  t.is(seam.client.defaults.timeout, 1_000)
})

test('SeamHttp: timeout option aborts slow requests', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    timeout: 1,
    axiosRetryOptions: { retries: 0 },
  })

  const err = await t.throwsAsync(async () => await seam.devices.list(), {
    instanceOf: AxiosError,
  })

  t.is(err?.code, AxiosError.ECONNABORTED)
})
