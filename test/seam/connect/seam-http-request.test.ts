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

  const device = await request.execute()
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)

  type Expected = ResponseFromSeamHttpRequest<typeof request>
  const validDeviceType: Expected['device_type'] = 'august_lock'
  t.truthy(validDeviceType)

  // @ts-expect-error Test invalid device type.
  const invalidDeviceType: Expected['device_type'] = 'invalid_device_type'
  t.truthy(invalidDeviceType)
})

test('SeamHttpRequest: does not make the request until awaited', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const request = seam.devices.get({ device_id: seed.august_device_1 })
  const device = await request
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttpRequest: url is a URL for requests without query string', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const { url } = seam.devices.list()
  t.true(url instanceof URL)
  t.deepEqual(
    toPlainUrlObject(url),
    toPlainUrlObject(new URL(`${endpoint}/devices/list`)),
  )
})

// UPSTREAM: The Seam API does not yet consistently support GET requests, so only POST is used.
test.failing(
  'SeamHttpRequest: url is a URL for requests with query string',
  async (t) => {
    const { seed, endpoint } = await getTestServer(t)
    const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
    const { url } = seam.devices.list({
      limit: 10,
      device_ids: [seed.august_device_1, seed.ecobee_device_1],
    })
    t.true(url instanceof URL)
    t.deepEqual(
      toPlainUrlObject(url),
      toPlainUrlObject(
        new URL(
          `${endpoint}/devices/get?device_ids=${seed.august_device_1}&device_ids=${seed.ecobee_device_1}&limit=10`,
        ),
      ),
    )
  },
)

test('SeamHttpRequest: url is a URL when endpoint is a url without a path', async (t) => {
  const { seed } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint: 'https://example.com',
  })

  const { url } = seam.devices.get({ device_id: 'abc123' })

  t.true(url instanceof URL)
  t.deepEqual(
    toPlainUrlObject(url),
    toPlainUrlObject(new URL('https://example.com/devices/get')),
  )
})

test('SeamHttpRequest: url is a URL when endpoint is a url with a path', async (t) => {
  const { seed } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint: 'https://example.com/some/sub/path',
  })

  const { url } = seam.devices.get({ device_id: 'abc123' })

  t.true(url instanceof URL)
  t.deepEqual(
    toPlainUrlObject(url),
    toPlainUrlObject(new URL('https://example.com/some/sub/path/devices/get')),
  )
})

test.failing(
  'SeamHttpRequest: url is a URL when endpoint is path',
  async (t) => {
    const { seed } = await getTestServer(t)
    const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
      endpoint: '/some/sub/path',
    })

    const { url } = seam.devices.get({ device_id: 'abc123' })

    t.true(url instanceof URL)
    t.deepEqual(
      toPlainUrlObject(url),
      toPlainUrlObject(
        new URL('https://example.com/some/sub/path/devices/get'),
      ),
    )
  },
)

test.failing(
  'SeamHttpRequest: url is a URL when endpoint is empty',
  async (t) => {
    const { seed } = await getTestServer(t)
    const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
      endpoint: '',
    })

    // TODO: Set globalThis.location.origin = 'https://example.com'

    const { url } = seam.devices.get({ device_id: 'abc123' })

    t.true(url instanceof URL)
    t.deepEqual(
      toPlainUrlObject(url),
      toPlainUrlObject(new URL('https://example.com/devices/get')),
    )
  },
)

test('SeamHttpRequest: url throws if unable to resolve origin', async (t) => {
  const { seed } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint: '',
  })

  const request = seam.devices.get({ device_id: 'abc123' })

  t.throws(() => request.url, { message: /Cannot resolve origin/ })
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
  T extends SeamHttpRequest<infer TResponse, infer TResponseKey>
    ? TResponseKey extends keyof TResponse
      ? TResponse[TResponseKey]
      : undefined
    : never
