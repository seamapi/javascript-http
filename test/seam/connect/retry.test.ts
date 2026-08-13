import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'

import test from 'ava'
import { AxiosError } from 'axios'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

test('SeamHttp: does not retry POST transport errors by default', async (t) => {
  let deliveries = 0
  const server = createServer((request) => {
    deliveries += 1
    request.resume()
    request.once('end', () => request.socket.destroy())
  })

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })
  t.teardown(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error != null) reject(error)
        else resolve()
      })
    })
  })

  const { port } = server.address() as AddressInfo
  const seam = SeamHttp.fromApiKey('seam_test_api_key', {
    endpoint: `http://127.0.0.1:${port}`,
  })

  const error = await t.throwsAsync(
    async () => await seam.client.post('/locks/unlock_door'),
    { instanceOf: AxiosError },
  )

  t.is(error?.code, 'ERR_NETWORK')
  t.is(deliveries, 1)
})

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
