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
})

test('endpoint rejects an empty required parameters object', (t) => {
  t.throws(
    () => {
      // @ts-expect-error Verify RequireAtLeastOne in the generated parameter type.
      seam.devices.get({})
    },
    {
      instanceOf: TypeError,
      message: 'Parameters for /devices/get must contain at least one property',
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
})
