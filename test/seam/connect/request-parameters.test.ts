import test from 'ava'

import { SeamHttp } from '@seamapi/http/connect'

const seam = SeamHttp.fromApiKey('seam_apikey1_token')

test('endpoint rejects missing required parameters', async (t) => {
  await t.throwsAsync(
    // @ts-expect-error Verify requiredness in the generated method signature.
    async () => await seam.devices.get(),
    {
      instanceOf: TypeError,
      message: 'Parameters are required for /devices/get',
    },
  )

  await t.throwsAsync(
    // @ts-expect-error Verify an explicitly required schema property makes the argument required.
    async () => await seam.devices.reportProviderMetadata(),
    {
      instanceOf: TypeError,
      message: 'Parameters are required for /devices/report_provider_metadata',
    },
  )
})

test('endpoint rejects missing individually required parameters', async (t) => {
  await t.throwsAsync(
    // @ts-expect-error Verify required schema properties at runtime.
    async () => await seam.devices.reportProviderMetadata({}),
    {
      instanceOf: TypeError,
      message:
        'Required parameters missing for /devices/report_provider_metadata: devices',
    },
  )

  await t.throwsAsync(
    async () =>
      await seam.devices.reportProviderMetadata({
        // @ts-expect-error Verify required schema properties cannot be undefined.
        devices: undefined,
      }),
    {
      instanceOf: TypeError,
      message:
        'Required parameters missing for /devices/report_provider_metadata: devices',
    },
  )

  await t.throwsAsync(
    async () =>
      // @ts-expect-error Verify all missing required parameters are reported.
      await seam.accessCodes.simulate.createUnmanagedAccessCode({
        code: '1234',
      }),
    {
      instanceOf: TypeError,
      message:
        'Required parameters missing for /access_codes/simulate/create_unmanaged_access_code: device_id, name',
    },
  )
})

test('endpoint rejects an empty required parameters object', async (t) => {
  await t.throwsAsync(
    // @ts-expect-error Verify RequireAtLeastOne in the generated parameter type.
    async () => await seam.devices.get({}),
    {
      instanceOf: TypeError,
      message: 'At least one parameter is required for /devices/get',
    },
  )
})

test('endpoint rejects required parameters with only undefined values', async (t) => {
  await t.throwsAsync(
    // @ts-expect-error Verify RequireAtLeastOne requires a defined value.
    async () => await seam.devices.get({ device_id: undefined }),
    {
      instanceOf: TypeError,
      message: 'At least one parameter is required for /devices/get',
    },
  )
})

test('endpoint rejects non-object parameters', async (t) => {
  await t.throwsAsync(
    // @ts-expect-error Verify the generated parameter type rejects primitives.
    async () => await seam.devices.list('invalid'),
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

test('endpoint defers parameter validation until the request is made', (t) => {
  // A request is a value: callers may build one before deciding to send it, or
  // to derive a cache key from it, so building must not throw on parameters
  // that are not ready yet.
  t.notThrows(() => {
    // @ts-expect-error Verify an invalid request still builds.
    seam.devices.get({ device_id: undefined })
  })
})

test('deferred validation reports from every request entrypoint', async (t) => {
  const expected = {
    instanceOf: TypeError,
    message: 'At least one parameter is required for /devices/get',
  }

  // @ts-expect-error Verify an invalid request builds and rejects on use.
  const build = () => seam.devices.get({ device_id: undefined })

  await t.throwsAsync(async () => await build().execute(), expected)
  await t.throwsAsync(async () => await build().fetchResponse(), expected)
  await t.throwsAsync(async () => await build(), expected)
  await t.throwsAsync(async () => await build().then(), expected)
})

test('deferred validation leaves request metadata readable', (t) => {
  // @ts-expect-error Verify an invalid request still exposes its metadata.
  const request = seam.devices.get({ device_id: undefined })

  t.is(request.pathname, '/devices/get')
  t.is(request.method, 'GET')
  t.deepEqual(request.params, { device_id: undefined })
})
