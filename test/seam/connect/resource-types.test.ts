import test from 'ava'

import type { AccessCode, UnmanagedAccessCode } from '@seamapi/http/connect'

const assertAccessCodeNarrowing = (
  code: AccessCode | UnmanagedAccessCode,
): AccessCode | UnmanagedAccessCode => {
  if (code.is_managed) {
    const managedAccessCode: AccessCode = code

    // @ts-expect-error A managed access code cannot be the unmanaged variant.
    const unmanagedAccessCode: UnmanagedAccessCode = code
    void unmanagedAccessCode

    return managedAccessCode
  }

  const unmanagedAccessCode: UnmanagedAccessCode = code

  // @ts-expect-error An unmanaged access code cannot be the managed variant.
  const managedAccessCode: AccessCode = code
  void managedAccessCode

  return unmanagedAccessCode
}

test('access code resources narrow on is_managed', (t) => {
  t.is(typeof assertAccessCodeNarrowing, 'function')
})
