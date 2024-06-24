import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import {
  SeamActionAttemptFailedError,
  SeamActionAttemptTimeoutError,
  SeamHttp,
} from '@seamapi/http/connect'

test('waitForActionAttempt: waits for pending action attempt', async (t) => {
  const { seed, endpoint, db } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')

  db.updateActionAttempt({
    action_attempt_id: actionAttempt.action_attempt_id,
    status: 'pending',
  })

  setTimeout(() => {
    db.updateActionAttempt({
      action_attempt_id: actionAttempt.action_attempt_id,
      status: 'success',
    })
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
  const { seed, endpoint, db } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')

  db.updateActionAttempt({
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
  const { seed, endpoint, db } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')

  db.updateActionAttempt({
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
  const { seed, endpoint, db } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.deepEqual(actionAttempt.status, 'pending')

  db.updateActionAttempt({
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
  const { seed, endpoint, db } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    waitForActionAttempt: false,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')

  db.updateActionAttempt({
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
