import test from 'ava'
import { AxiosError } from 'axios'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

test('SeamHttp: retries 503 status errors twice by default ', async (t) => {
  const { seed, endpoint, db } = await getTestServer(t)
  const expectedRetryCount = 2

  db.simulateWorkspaceOutage(seed.seed_workspace_1, {
    routes: ['/devices/list'],
  })

  t.plan(expectedRetryCount + 2)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    axiosRetryOptions: {
      onRetry: (retryCount) => {
        t.true(retryCount <= expectedRetryCount)
      },
    },
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
