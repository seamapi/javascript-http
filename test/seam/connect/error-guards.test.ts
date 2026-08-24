import test from 'ava'

import {
  type ActionAttempt,
  type FailedActionAttempt,
  isSeamActionAttemptError,
  isSeamActionAttemptFailedError,
  isSeamActionAttemptTimeoutError,
  isSeamHttpApiError,
  isSeamHttpInvalidInputError,
  isSeamHttpUnauthorizedError,
  SeamActionAttemptError,
  SeamActionAttemptFailedError,
  SeamActionAttemptTimeoutError,
  SeamHttpApiError,
  SeamHttpInvalidInputError,
  SeamHttpUnauthorizedError,
} from '@seamapi/http/connect'

const apiError = new SeamHttpApiError(
  { type: 'device_not_found', message: 'Device not found' },
  404,
  'request-1',
)

const unauthorizedError = new SeamHttpUnauthorizedError('request-1')

const invalidInputError = new SeamHttpInvalidInputError(
  {
    type: 'invalid_input',
    message: 'Invalid input',
    validation_errors: { device_id: { _errors: ['Required'] } },
  },
  400,
  'request-1',
)

const pendingActionAttempt = {
  action_attempt_id: 'e2192660-0e45-4a11-9800-eb4d086cca09',
  action_type: 'UNLOCK_DOOR',
  status: 'pending',
  error: null,
  result: null,
} as unknown as ActionAttempt

const failedActionAttempt = {
  ...pendingActionAttempt,
  status: 'error',
  error: { message: 'Failed', type: 'foo' },
} as unknown as FailedActionAttempt<ActionAttempt>

const actionAttemptError = new SeamActionAttemptError(
  'Something happened',
  pendingActionAttempt,
)

const actionAttemptFailedError = new SeamActionAttemptFailedError(
  failedActionAttempt,
)

const actionAttemptTimeoutError = new SeamActionAttemptTimeoutError(
  pendingActionAttempt,
  100,
)

const unrelatedValues = [new Error('unrelated'), null, undefined, {}, 'error']

test('isSeamHttpApiError: matches every Seam API error', (t) => {
  t.true(isSeamHttpApiError(apiError))
  t.true(isSeamHttpApiError(unauthorizedError))
  t.true(isSeamHttpApiError(invalidInputError))
  t.false(isSeamHttpApiError(actionAttemptError))
  for (const value of unrelatedValues) t.false(isSeamHttpApiError(value))
})

test('isSeamHttpUnauthorizedError: matches only the unauthorized error', (t) => {
  t.true(isSeamHttpUnauthorizedError(unauthorizedError))
  t.false(isSeamHttpUnauthorizedError(apiError))
  t.false(isSeamHttpUnauthorizedError(invalidInputError))
  for (const value of unrelatedValues) {
    t.false(isSeamHttpUnauthorizedError(value))
  }
})

test('isSeamHttpInvalidInputError: matches only the invalid input error', (t) => {
  t.true(isSeamHttpInvalidInputError(invalidInputError))
  t.false(isSeamHttpInvalidInputError(apiError))
  t.false(isSeamHttpInvalidInputError(unauthorizedError))
  for (const value of unrelatedValues) {
    t.false(isSeamHttpInvalidInputError(value))
  }
})

test('isSeamActionAttemptError: matches every action attempt error', (t) => {
  t.true(isSeamActionAttemptError(actionAttemptError))
  t.true(isSeamActionAttemptError(actionAttemptFailedError))
  t.true(isSeamActionAttemptError(actionAttemptTimeoutError))
  t.false(isSeamActionAttemptError(apiError))
  for (const value of unrelatedValues) t.false(isSeamActionAttemptError(value))
})

test('isSeamActionAttemptFailedError: matches only the failed error', (t) => {
  t.true(isSeamActionAttemptFailedError(actionAttemptFailedError))
  t.false(isSeamActionAttemptFailedError(actionAttemptError))
  t.false(isSeamActionAttemptFailedError(actionAttemptTimeoutError))
  for (const value of unrelatedValues) {
    t.false(isSeamActionAttemptFailedError(value))
  }
})

test('isSeamActionAttemptTimeoutError: matches only the timeout error', (t) => {
  t.true(isSeamActionAttemptTimeoutError(actionAttemptTimeoutError))
  t.false(isSeamActionAttemptTimeoutError(actionAttemptError))
  t.false(isSeamActionAttemptTimeoutError(actionAttemptFailedError))
  for (const value of unrelatedValues) {
    t.false(isSeamActionAttemptTimeoutError(value))
  }
})
