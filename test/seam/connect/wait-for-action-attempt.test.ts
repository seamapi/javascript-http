import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'
import nock from 'nock'

import {
  SeamActionAttemptFailedError,
  SeamActionAttemptTimeoutError,
  SeamHttp,
  SeamHttpInvalidOptionsError,
} from '@seamapi/http/connect'

test('waitForActionAttempt: waits for pending action attempt', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')

  await seam.client.post('/_fake/update_action_attempt', {
    action_attempt_id: actionAttempt.action_attempt_id,
    status: 'pending',
  })

  setTimeout(async () => {
    try {
      await seam.client.post('/_fake/update_action_attempt', {
        action_attempt_id: actionAttempt.action_attempt_id,
        status: 'success',
      })
    } catch (err) {
      t.log(err)
    }
  }, 1000)

  const { status } = await seam.actionAttempts.get(
    {
      action_attempt_id: actionAttempt.action_attempt_id,
    },
    {
      waitForActionAttempt: true,
    },
  )
  t.is(status, 'success')
})

test('waitForActionAttempt: returns successful action attempt', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')

  await seam.client.post('/_fake/update_action_attempt', {
    action_attempt_id: actionAttempt.action_attempt_id,
    status: 'success',
  })

  const successfulActionAttempt = await seam.actionAttempts.get({
    action_attempt_id: actionAttempt.action_attempt_id,
  })

  if (successfulActionAttempt.status !== 'success') {
    t.fail('Action attempt status did not update to success')
    return
  }

  const resolvedActionAttempt = await seam.actionAttempts.get(
    {
      action_attempt_id: actionAttempt.action_attempt_id,
    },
    {
      waitForActionAttempt: true,
    },
  )

  t.deepEqual(resolvedActionAttempt, successfulActionAttempt)
})

test('waitForActionAttempt: times out while waiting for action attempt', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')

  await seam.client.post('/_fake/update_action_attempt', {
    action_attempt_id: actionAttempt.action_attempt_id,
    status: 'pending',
  })

  const err = await t.throwsAsync(
    async () =>
      await seam.actionAttempts.get(
        {
          action_attempt_id: actionAttempt.action_attempt_id,
        },
        {
          waitForActionAttempt: {
            timeout: 100,
          },
        },
      ),
    { instanceOf: SeamActionAttemptTimeoutError },
  )

  t.deepEqual(err?.actionAttempt, actionAttempt)
})

test('waitForActionAttempt: rejects when action attempt fails', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.deepEqual(actionAttempt.status, 'pending')

  await seam.client.post('/_fake/update_action_attempt', {
    action_attempt_id: actionAttempt.action_attempt_id,
    status: 'error',
    error: {
      message: 'Failed',
      type: 'foo',
    },
  })

  const err = await t.throwsAsync(
    async () =>
      await seam.actionAttempts.get(
        {
          action_attempt_id: actionAttempt.action_attempt_id,
        },
        {
          waitForActionAttempt: true,
        },
      ),
    { instanceOf: SeamActionAttemptFailedError, message: 'Failed' },
  )

  t.is(err?.actionAttempt.action_attempt_id, actionAttempt.action_attempt_id)
  t.is(err?.actionAttempt.status, 'error')
  t.is(err?.code, 'foo')
})

test('waitForActionAttempt: times out if waiting for polling interval', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')

  await seam.client.post('/_fake/update_action_attempt', {
    action_attempt_id: actionAttempt.action_attempt_id,
    status: 'pending',
  })

  const err = await t.throwsAsync(
    async () =>
      await seam.actionAttempts.get(
        {
          action_attempt_id: actionAttempt.action_attempt_id,
        },
        {
          waitForActionAttempt: {
            timeout: 500,
            pollingInterval: 10_000,
          },
        },
      ),
    { instanceOf: SeamActionAttemptTimeoutError },
  )

  t.deepEqual(err?.actionAttempt, actionAttempt)
})

test('waitForActionAttempt: rejects when a failed action attempt has no error object', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  nock(endpoint)
    .post('/locks/unlock_door')
    .reply(200, {
      action_attempt: {
        action_attempt_id: 'e2192660-0e45-4a11-9800-eb4d086cca09',
        action_type: 'UNLOCK_DOOR',
        status: 'error',
        error: null,
        result: null,
      },
    })

  const err = await t.throwsAsync(
    async () =>
      await seam.locks.unlockDoor(
        { device_id: seed.august_device_1 },
        { waitForActionAttempt: true },
      ),
    {
      instanceOf: SeamActionAttemptFailedError,
      message: 'Action attempt failed',
    },
  )

  t.is(err?.code, 'unknown')
})

test('waitForActionAttempt: stops polling after the timeout', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  await seam.client.post('/_fake/update_action_attempt', {
    action_attempt_id: actionAttempt.action_attempt_id,
    status: 'pending',
  })

  let pollCount = 0
  seam.client.interceptors.request.use((config) => {
    if (config.url === '/action_attempts/get') pollCount++
    return config
  })

  const err = await t.throwsAsync(
    async () =>
      await seam.actionAttempts.get(
        { action_attempt_id: actionAttempt.action_attempt_id },
        { waitForActionAttempt: { timeout: 300, pollingInterval: 100 } },
      ),
    { instanceOf: SeamActionAttemptTimeoutError },
  )

  t.regex(err?.message ?? '', /Timed out waiting for action attempt/)

  const pollCountAtTimeout = pollCount
  t.true(pollCountAtTimeout > 0)

  await new Promise((resolve) => setTimeout(resolve, 500))
  t.is(pollCount, pollCountAtTimeout)
})

test('waitForActionAttempt: polls at least once when the timeout is shorter than the pollingInterval', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  await seam.client.post('/_fake/update_action_attempt', {
    action_attempt_id: actionAttempt.action_attempt_id,
    status: 'pending',
  })

  let requestCount = 0
  seam.client.interceptors.request.use((config) => {
    if (config.url === '/action_attempts/get') requestCount++
    return config
  })

  const start = Date.now()
  await t.throwsAsync(
    async () =>
      await seam.actionAttempts.get(
        { action_attempt_id: actionAttempt.action_attempt_id },
        { waitForActionAttempt: { timeout: 300, pollingInterval: 60_000 } },
      ),
    { instanceOf: SeamActionAttemptTimeoutError },
  )

  // The initial request plus exactly one poll before the deadline.
  t.is(requestCount, 2)
  t.true(Date.now() - start < 10_000)
})

test('waitForActionAttempt: rejects a negative timeout', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  await t.throwsAsync(
    async () =>
      await seam.actionAttempts.get(
        { action_attempt_id: actionAttempt.action_attempt_id },
        { waitForActionAttempt: { timeout: -1 } },
      ),
    {
      instanceOf: SeamHttpInvalidOptionsError,
      message: /timeout option must not be negative/,
    },
  )
})

test('waitForActionAttempt: rejects a pollingInterval of zero', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  await t.throwsAsync(
    async () =>
      await seam.actionAttempts.get(
        { action_attempt_id: actionAttempt.action_attempt_id },
        { waitForActionAttempt: { pollingInterval: 0 } },
      ),
    {
      instanceOf: SeamHttpInvalidOptionsError,
      message: /pollingInterval option must be greater than zero/,
    },
  )
})

test('waitForActionAttempt: waits directly on returned action attempt', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor(
    {
      device_id: seed.august_device_1,
    },
    { waitForActionAttempt: true },
  )

  t.is(actionAttempt.status, 'success')
})

test('waitForActionAttempt: waits by default', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'success')
})

test('waitForActionAttempt: can set class default', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')
})

test('waitForActionAttempt: can set class default with object', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: {
      timeout: 5000,
    },
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'success')
})
