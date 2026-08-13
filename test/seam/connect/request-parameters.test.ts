import test from 'ava'

import { SeamHttp } from '@seamapi/http/connect'

const seam = SeamHttp.fromApiKey('seam_apikey1_token')

test('endpoint rejects missing required parameters', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Verify requiredness in the generated method signature.
      seam.devices.get()
    },
    {
      instanceOf: TypeError,
      message: 'Parameters are required for /devices/get',
    },
  )

  t.throws(
    () => {
      // @ts-expect-error Verify an explicitly required schema property makes the argument required.
      seam.devices.reportProviderMetadata()
    },
    {
      instanceOf: TypeError,
      message: 'Parameters are required for /devices/report_provider_metadata',
    },
  )
})

test('endpoint rejects missing individually required parameters', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Verify required schema properties at runtime.
      seam.devices.reportProviderMetadata({})
    },
    {
      instanceOf: TypeError,
      message:
        'Parameter devices is required for /devices/report_provider_metadata',
    },
  )

  t.throws(
    () => {
      // @ts-expect-error Verify required schema properties cannot be undefined.
      seam.devices.reportProviderMetadata({ devices: undefined })
    },
    {
      instanceOf: TypeError,
      message:
        'Parameter devices is required for /devices/report_provider_metadata',
    },
  )
})

test('endpoint rejects an empty required parameters object', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Verify RequireAtLeastOne in the generated parameter type.
      seam.devices.get({})
    },
    {
      instanceOf: TypeError,
      message: 'At least one parameter is required for /devices/get',
    },
  )
})

test('endpoint rejects required parameters with only undefined values', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Verify RequireAtLeastOne requires a defined value.
      seam.devices.get({ device_id: undefined })
    },
    {
      instanceOf: TypeError,
      message: 'At least one parameter is required for /devices/get',
    },
  )
})

test('endpoint rejects non-object parameters', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Verify the generated parameter type rejects primitives.
      seam.devices.list('invalid')
    },
    {
      instanceOf: TypeError,
      message: 'Parameters for /devices/list must be an object',
    },
  )
})

test('endpoint accepts omitted optional parameters', (t) => {
  t.notThrows(() => seam.devices.list())
})

test('endpoint accepts required parameters', (t) => {
  t.notThrows(() => seam.devices.get({ device_id: 'device-id' }))
  t.notThrows(() => seam.devices.get({ name: 'Front Door' }))
  t.notThrows(() => seam.devices.reportProviderMetadata({ devices: [] }))
})
