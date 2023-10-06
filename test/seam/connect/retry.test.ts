import test from 'ava'
import { AxiosError } from 'axios'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

test('SeamHttp: retries 503 status errors twice by default ', async (t) => {
  const { seed, endpoint, db } = await getTestServer(t)

  db.simulateWorkspaceOutage(seed.seed_workspace_1, {
    routes: ['/devices/get'],
  })

  t.plan(4)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    axiosRetryOptions: {
      onRetry: (retryCount) => {
        t.true(retryCount < 3)
      },
    },
  })

  const err = await t.throwsAsync(
    async () =>
      // UPSTREAM: This test should use seam.devices.get({ device_id: '...' }).
      // Only idempotent methods, e.g., GET not POST, are retried by default.
      // The SDK should use GET over POST once that method is supported upstream.
      // https://github.com/seamapi/nextlove/issues/117
      await seam.client.get('/devices/get', {
        params: {
          device_id: seed.august_device_1,
        },
      }),
    { instanceOf: AxiosError },
  )

  t.is(err?.response?.status, 503)
})
