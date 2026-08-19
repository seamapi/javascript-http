import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

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

test('SeamHttp: retries timed-out GET requests', async (t) => {
  let attempts = 0
  const server = createServer((_request, _response) => {
    attempts += 1
  })

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })
  t.teardown(() => {
    server.closeAllConnections()
    server.close()
  })

  const { port } = server.address() as AddressInfo
  const seam = SeamHttp.fromApiKey('seam_test_api_key', {
    endpoint: `http://127.0.0.1:${port}`,
    timeout: 100,
  })

  const error = await t.throwsAsync(
    async () => await seam.client.get('/slow'),
    {
      instanceOf: AxiosError,
    },
  )

  t.is(error?.code, AxiosError.ETIMEDOUT)
  t.is(attempts, 3)
})

test('SeamHttp: does not retry timed-out POST requests', async (t) => {
  let attempts = 0
  const server = createServer((_request, _response) => {
    attempts += 1
  })

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })
  t.teardown(() => {
    server.closeAllConnections()
    server.close()
  })

  const { port } = server.address() as AddressInfo
  const seam = SeamHttp.fromApiKey('seam_test_api_key', {
    endpoint: `http://127.0.0.1:${port}`,
    timeout: 100,
  })

  const error = await t.throwsAsync(
    async () => await seam.client.post('/slow'),
    { instanceOf: AxiosError },
  )

  t.is(error?.code, AxiosError.ETIMEDOUT)
  t.is(attempts, 1)
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

  // The SDK uses the fetch adapter, which reports timeouts as ETIMEDOUT.
  t.is(err?.code, AxiosError.ETIMEDOUT)
})
