import { createServer } from 'node:http'

import test from 'ava'
import { AxiosError } from 'axios'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

test('SeamHttp: retries 503 status errors twice by default ', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const expectedRetryCount = 2

  t.plan(expectedRetryCount + 2)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    axiosRetryOptions: {
      onRetry: (retryCount) => {
        t.true(retryCount <= expectedRetryCount)
      },
    },
  })

  await seam.client.post('/_fake/simulate_workspace_outage', {
    workspace_id: seed.seed_workspace_1,
    routes: ['/devices/list'],
  })

  const err = await t.throwsAsync(
    // UPSTREAM: This test should use seam.devices.list().
    // Only idempotent methods, e.g., GET not POST, are retried by default.
    // The SDK should use GET over POST once that method is supported upstream.
    // https://github.com/seamapi/nextlove/issues/117
    async () => await seam.client.get('/devices/list'),
    { instanceOf: AxiosError },
  )

  t.is(err?.response?.status, 503)
})

test('SeamHttp: does not retry POST requests by default', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    axiosRetryOptions: {
      onRetry: () => {
        t.fail('should not retry a POST request')
      },
    },
  })

  await seam.client.post('/_fake/simulate_workspace_outage', {
    workspace_id: seed.seed_workspace_1,
    routes: ['/devices/list'],
  })

  // devices.list is a POST under the hood, so a mid-flight failure here must
  // not be replayed.
  const err = await t.throwsAsync(async () => await seam.devices.list(), {
    instanceOf: AxiosError,
  })

  t.is(err?.response?.status, 503)
})

test('SeamHttp: does not replay a POST after a mid-flight connection reset', async (t) => {
  let attempts = 0

  // A raw server that receives the full request and then resets the
  // connection without ever sending a response, e.g., as if a load balancer
  // or proxy dropped the connection after forwarding the request upstream.
  const server = createServer((req) => {
    attempts++
    req.resume()
    req.on('end', () => {
      req.socket.destroy()
    })
  })

  await new Promise<void>((resolve) => {
    server.listen(0, resolve)
  })
  t.teardown(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve())
    })
  })

  const address = server.address()
  if (address == null || typeof address === 'string') {
    throw new Error('Could not determine server address')
  }

  const seam = SeamHttp.fromApiKey('seam_invalidapikey_token', {
    endpoint: `http://127.0.0.1:${address.port}`,
  })

  await t.throwsAsync(async () => await seam.devices.list())

  t.is(attempts, 1)
})
