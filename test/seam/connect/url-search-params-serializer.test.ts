import test from 'ava'

import {
  serializeUrlSearchParams,
  updateUrlSearchParams,
} from '@seamapi/http/connect'

test('serializeUrlSearchParams adds strict mode to a non-empty query', (t) => {
  t.is(
    serializeUrlSearchParams({
      device_ids: ['device1', 'device2'],
    }),
    'device_ids=device1&device_ids=device2&_strict=true',
  )
})

test('serializeUrlSearchParams leaves an empty query empty', (t) => {
  t.is(serializeUrlSearchParams({}), '')
  t.is(serializeUrlSearchParams({ device_ids: undefined }), '')
})

test('serializeUrlSearchParams overrides the strict param', (t) => {
  t.is(serializeUrlSearchParams({ _strict: false }), '_strict=true')
})

test('updateUrlSearchParams adds strict mode to non-empty params', (t) => {
  const searchParams = new URLSearchParams()

  updateUrlSearchParams(searchParams, {
    device_ids: ['device1', 'device2'],
  })

  t.is(
    searchParams.toString(),
    'device_ids=device1&device_ids=device2&_strict=true',
  )
})

test('updateUrlSearchParams leaves empty params empty', (t) => {
  const searchParams = new URLSearchParams()

  updateUrlSearchParams(searchParams, {})

  t.is(searchParams.toString(), '')
})

test('updateUrlSearchParams adds strict mode to existing params', (t) => {
  const searchParams = new URLSearchParams({ existing: 'value' })

  updateUrlSearchParams(searchParams, {})

  t.is(searchParams.toString(), 'existing=value&_strict=true')
})
