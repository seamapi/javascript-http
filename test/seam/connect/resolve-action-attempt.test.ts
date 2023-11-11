import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import {
  resolveActionAttempt,
  SeamActionAttemptFailedError,
  SeamActionAttemptTimeoutError,
  SeamHttp,
} from '@seamapi/http/connect'

test('resolveActionAttempt: waits for pending action attempt', async (t) => {
  const { seed, endpoint, db } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')

  setTimeout(() => {
    db.updateActionAttempt({
      action_attempt_id: actionAttempt.action_attempt_id,
      status: 'success',
    })
  }, 1000)

  const { status } = await resolveActionAttempt(actionAttempt, seam)
  t.is(status, 'success')
})

test('resolveActionAttempt: returns successful action attempt', async (t) => {
  const { seed, endpoint, db } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
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

  const resolvedActionAttempt = await resolveActionAttempt(
    successfulActionAttempt,
    seam,
  )

  t.is(resolvedActionAttempt, successfulActionAttempt)
})

test('resolveActionAttempt: times out while waiting for action attempt', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')

  const err = await t.throwsAsync(
    async () =>
      await resolveActionAttempt(actionAttempt, seam, {
        timeout: 100,
      }),
    { instanceOf: SeamActionAttemptTimeoutError },
  )

  t.is(err?.actionAttempt, actionAttempt)
})

test('resolveActionAttempt: rejects when action attempt fails', async (t) => {
  const { seed, endpoint, db } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  t.is(actionAttempt.status, 'pending')

  db.updateActionAttempt({
    action_attempt_id: actionAttempt.action_attempt_id,
    status: 'error',
    error: {
      message: 'Failed',
      type: 'foo',
    },
  })

  const err = await t.throwsAsync(
    async () => await resolveActionAttempt(actionAttempt, seam),
    { instanceOf: SeamActionAttemptFailedError, message: 'Failed' },
  )

  t.is(err?.actionAttempt.action_attempt_id, actionAttempt.action_attempt_id)
  t.is(err?.actionAttempt.status, 'error')
  t.is(err?.code, 'foo')
})

test('resolveActionAttempt: times out if waiting for polling interval', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
  })

  const actionAttempt = await seam.locks.unlockDoor({
    device_id: seed.august_device_1,
  })

  const err = await t.throwsAsync(
    async () =>
      await resolveActionAttempt(actionAttempt, seam, {
        timeout: 500,
        pollingInterval: 10_000,
      }),
    { instanceOf: SeamActionAttemptTimeoutError },
  )

  t.is(err?.actionAttempt, actionAttempt)
})
