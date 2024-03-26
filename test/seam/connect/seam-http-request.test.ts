import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp } from '@seamapi/http/connect'

import { SeamHttpRequest } from 'lib/seam/connect/seam-http-request.js'

test('SeamHttp: returns a SeamHttpRequest', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  const request = seam.devices.get({ device_id: seed.august_device_1 })

  t.true(request instanceof SeamHttpRequest)
  t.truthy(request.url)
  t.is(request.responseKey, 'device')
  t.deepEqual(request.body, {
    device_id: seed.august_device_1,
  })

  const device = await request
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)

  // Ensure that the type of the response is correct.
  type Expected = ResponseFromSeamHttpRequest<typeof request>
  const validDeviceType: Expected['device_type'] = 'august_lock'
  t.truthy(validDeviceType)

  // @ts-expect-error invalid device type.
  const invalidDeviceType: Expected['device_type'] = 'invalid_device_type'
  t.truthy(invalidDeviceType)
})

test('SeamHttpRequest: url is a URL for post requests', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  const { url } = seam.devices.get({ device_id: 'abc123' })

  t.true(url instanceof URL)
  t.deepEqual(
    toPlainUrlObject(url),
    toPlainUrlObject(new URL(`${endpoint}/devices/get`)),
  )
})

test('SeamHttpRequest: url is a URL for get requests', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  const { url } = seam.connectWebviews.view({
    connect_webview_id: 'connect_webview_1',
    auth_token: 'auth_token_1',
  })

  t.true(url instanceof URL)
  t.deepEqual(
    toPlainUrlObject(url),
    toPlainUrlObject(
      new URL(
        `${endpoint}/connect_webviews/view?auth_token=auth_token_1&connect_webview_id=connect_webview_1`,
      ),
    ),
  )
})

const toPlainUrlObject = (url: URL): Omit<URL, 'searchParams' | 'toJSON'> => {
  return {
    pathname: url.pathname,
    hash: url.hash,
    hostname: url.hostname,
    protocol: url.protocol,
    username: url.username,
    port: url.port,
    password: url.password,
    host: url.host,
    href: url.href,
    origin: url.origin,
    search: url.search,
  }
}

type ResponseFromSeamHttpRequest<T> =
  T extends SeamHttpRequest<any, infer TResponse, infer TResponseKey>
    ? TResponseKey extends keyof TResponse
      ? TResponse[TResponseKey]
      : undefined
    : never
