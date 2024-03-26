import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

import { SeamHttpRequest } from 'lib/seam/connect/seam-http-request.js'

test('returns a SeamHttpRequest', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  const deviceRequest = seam.devices.get({ device_id: seed.august_device_1 })

  t.true(deviceRequest instanceof SeamHttpRequest)
  t.is(deviceRequest.url.pathname, '/devices/get')
  t.deepEqual(deviceRequest.body, {
    device_id: seed.august_device_1,
  })
  t.is(deviceRequest.responseKey, 'device')
  const device = await deviceRequest
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)

  // Ensure that the type of the response is correct.
  type Expected = ResponseFromSeamHttpRequest<typeof deviceRequest>

  const validDeviceType: Expected['device_type'] = 'august_lock'
  t.truthy(validDeviceType)

  // @ts-expect-error because it's an invalid device type.
  const invalidDeviceType: Expected['device_type'] = 'invalid_device_type'
  t.truthy(invalidDeviceType)
})

test("populates SeamHttpRequest's url property", async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  const deviceRequest = seam.devices.get({ device_id: 'abc123' })

  t.is(deviceRequest.url.pathname, '/devices/get')
  t.is(deviceRequest.url.search, '')

  const connectWebviewsViewRequest = seam.connectWebviews.view({
    connect_webview_id: 'abc123',
    auth_token: 'invalid',
  })

  t.is(connectWebviewsViewRequest.url.pathname, '/connect_webviews/view')
  t.is(connectWebviewsViewRequest.url.searchParams.get('auth_token'), 'invalid')
  t.is(
    connectWebviewsViewRequest.url.searchParams.get('connect_webview_id'),
    'abc123',
  )
})

type ResponseFromSeamHttpRequest<T> =
  T extends SeamHttpRequest<any, infer TResponse, infer TResponseKey>
    ? TResponseKey extends keyof TResponse
      ? TResponse[TResponseKey]
      : undefined
    : never
