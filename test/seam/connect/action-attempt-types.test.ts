import test from 'ava'

import type {
  ActionAttempt,
  FailedActionAttempt,
  SucceededActionAttempt,
} from '@seamapi/http/connect'

import {
  type ActionAttemptsClient,
  resolveActionAttempt,
} from 'lib/resolve-action-attempt.js'

const expectType = <Expected>(_value: Expected): void => {}

type LockDoorActionAttempt = Extract<
  ActionAttempt,
  { action_type: 'LOCK_DOOR' }
>

const assertUnnarrowedDereferenceFails = (
  actionAttempt: LockDoorActionAttempt,
): void => {
  // @ts-expect-error The result is null unless the status is success.
  expectType<unknown>(actionAttempt.result.was_confirmed_by_device)

  // @ts-expect-error The error is null unless the status is error.
  expectType<unknown>(actionAttempt.error.message)
}

test('action attempt result and error cannot be dereferenced without narrowing', (t) => {
  t.is(typeof assertUnnarrowedDereferenceFails, 'function')
})

const assertSuccessNarrowing = (actionAttempt: LockDoorActionAttempt): void => {
  if (actionAttempt.status === 'success') {
    expectType<boolean | undefined>(
      actionAttempt.result.was_confirmed_by_device,
    )
    expectType<null>(actionAttempt.error)
  }
}

test('narrowing on success status needs no null check on result', (t) => {
  t.is(typeof assertSuccessNarrowing, 'function')
})

const assertErrorNarrowing = (actionAttempt: LockDoorActionAttempt): void => {
  if (actionAttempt.status === 'error') {
    expectType<string>(actionAttempt.error.message)
    expectType<string>(actionAttempt.error.type)
    expectType<null>(actionAttempt.result)
  }
}

test('narrowing on error status needs no null check on error', (t) => {
  t.is(typeof assertErrorNarrowing, 'function')
})

const assertResolvedActionAttemptIsSucceeded = async (
  actionAttempt: LockDoorActionAttempt,
  actionAttempts: ActionAttemptsClient,
): Promise<void> => {
  const resolved = await resolveActionAttempt(actionAttempt, actionAttempts, {})
  expectType<SucceededActionAttempt<LockDoorActionAttempt>>(resolved)
  expectType<'success'>(resolved.status)
  expectType<boolean | undefined>(resolved.result.was_confirmed_by_device)
  expectType<null>(resolved.error)
}

test('waiting for an action attempt returns the extracted success type', (t) => {
  t.is(typeof assertResolvedActionAttemptIsSucceeded, 'function')
})

const assertPendingActionAttemptTypes = (
  actionAttempt: Extract<LockDoorActionAttempt, { status: 'pending' }>,
): void => {
  expectType<null>(actionAttempt.error)
  expectType<null>(actionAttempt.result)
}

test('pending action attempts type status-dependent values as null', (t) => {
  t.is(typeof assertPendingActionAttemptTypes, 'function')
})

const assertFailedActionAttemptHasError = (
  actionAttempt: FailedActionAttempt<LockDoorActionAttempt>,
): void => {
  expectType<string>(actionAttempt.error.message)
  expectType<null>(actionAttempt.result)
}

test('failed action attempts type the error as non-null', (t) => {
  t.is(typeof assertFailedActionAttemptHasError, 'function')
})
