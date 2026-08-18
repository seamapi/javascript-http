import test from 'ava'

import type {
  AccessCode,
  Device,
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

const assertCustomMetadataValueTypes = (device: Device): void => {
  expectType<Record<string, string | boolean>>(device.custom_metadata)

  // @ts-expect-error Custom metadata values cannot be arbitrary objects.
  device.custom_metadata.example = {}
}

test('record resources use their declared value types', (t) => {
  t.is(typeof assertCustomMetadataValueTypes, 'function')
})
