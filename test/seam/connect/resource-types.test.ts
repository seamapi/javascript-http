import test from 'ava'

import type {
  AccessCode,
  ActionAttempt,
  Device,
  FailedActionAttempt,
  SucceededActionAttempt,
  UnmanagedAccessCode,
} from '@seamapi/http/connect'

const expectType = <Expected>(_value: Expected): void => {}

const assertAccessCodeNarrowing = (
  code: AccessCode | UnmanagedAccessCode,
): void => {
  if (code.is_managed) {
    expectType<AccessCode>(code)

    // @ts-expect-error A managed access code cannot be the unmanaged variant.
    expectType<UnmanagedAccessCode>(code)
    return
  }

  expectType<UnmanagedAccessCode>(code)

  // @ts-expect-error An unmanaged access code cannot be the managed variant.
  expectType<AccessCode>(code)
}

test('access code resources narrow on is_managed', (t) => {
  t.is(typeof assertAccessCodeNarrowing, 'function')
})

const assertActionAttemptNullability = (actionAttempt: ActionAttempt): void => {
  expectType<object | null>(actionAttempt.error)
  expectType<object | null>(actionAttempt.result)

  // @ts-expect-error The result is null unless the action attempt succeeded.
  Object.keys(actionAttempt.result)

  // @ts-expect-error The error is null unless the action attempt failed.
  expectType<string>(actionAttempt.error.message)
}

const assertResolvedActionAttemptNarrowing = (
  succeeded: SucceededActionAttempt<ActionAttempt>,
  failed: FailedActionAttempt<ActionAttempt>,
): void => {
  expectType<object>(succeeded.result)
  expectType<null>(succeeded.error)

  expectType<string>(failed.error.message)
  expectType<string>(failed.error.type)
  expectType<null>(failed.result)
}

test('action attempt error and result are null unless resolved', (t) => {
  t.is(typeof assertActionAttemptNullability, 'function')
  t.is(typeof assertResolvedActionAttemptNarrowing, 'function')
})

const assertCustomMetadataValueTypes = (device: Device): void => {
  expectType<Record<string, string | boolean>>(device.custom_metadata)

  // @ts-expect-error Custom metadata values cannot be arbitrary objects.
  device.custom_metadata.example = {}
}

test('record resources use their declared value types', (t) => {
  t.is(typeof assertCustomMetadataValueTypes, 'function')
})
