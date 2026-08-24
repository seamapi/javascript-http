import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'
import nock from 'nock'

import { SeamHttp, SeamPaginator } from '@seamapi/http/connect'

test('SeamPaginator: creates a SeamPaginator', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const pages = seam.createPaginator(seam.devices.list())
  t.true(pages instanceof SeamPaginator)
})

test('SeamPaginator: cannot paginate a request with an empty response', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  t.throws(
    () =>
      seam.createPaginator(
        // @ts-expect-error Testing validation of a non-paginated request.
        seam.devices.update({ device_id: 'test-device-id' }),
      ),
    { message: /does not support pagination/ },
  )
})

test('SeamPaginator: cannot paginate a request that does not return pagination data', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  t.throws(() => seam.createPaginator(seam.workspaces.list()), {
    message: /does not support pagination/,
  })
})

test('SeamPaginator: firstPage returns the first page', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const pages = seam.createPaginator(seam.devices.list({ limit: 2 }))
  const [devices, pagination] = await pages.firstPage()
  t.is(devices.length, 2)
  t.true(pagination.hasNextPage)
  t.truthy(pagination.nextPageCursor)
  t.truthy(pagination.nextPageUrl)
})

test('SeamPaginator: nextPage returns the next page', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const pages = seam.createPaginator(seam.devices.list({ limit: 2 }))
  const [devices, { hasNextPage, nextPageCursor }] = await pages.firstPage()
  t.is(devices.length, 2)
  t.true(hasNextPage)
  const [moreDevices] = await pages.nextPage(nextPageCursor)
  t.is(moreDevices.length, 2)
})

test('SeamPaginator: nextPage requires the nextPageCursor', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const pages = seam.createPaginator(seam.devices.list({ limit: 2 }))
  await t.throwsAsync(async () => await pages.nextPage(null), {
    message: /nextPageCursor/,
  })
})

test('SeamPaginator: flattenToArray returns an array of devices', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const allDevices = await seam.devices.list()
  const pages = seam.createPaginator(seam.devices.list({ limit: 1 }))
  const devices = await pages.flattenToArray()
  t.true(devices.length > 1)
  t.is(devices.length, allDevices.length)
})

test('SeamPaginator: flatten allows iteration over all devices', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const allDevices = await seam.devices.list()
  const pages = seam.createPaginator(seam.devices.list({ limit: 1 }))

  const devices = []
  for await (const device of pages.flatten()) {
    devices.push(device)
  }
  t.true(devices.length > 1)
  t.is(devices.length, allDevices.length)
})

test('SeamPaginator: validates request parameters before fetching a page', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  let requestCount = 0
  seam.client.interceptors.request.use((config) => {
    if (config.url === '/access_codes/list') requestCount++
    return config
  })

  const pages = seam.createPaginator(
    // @ts-expect-error Verify an invalid request is rejected when paginated.
    seam.accessCodes.list({}),
  )

  await t.throwsAsync(async () => await pages.firstPage(), {
    instanceOf: TypeError,
    message: 'At least one parameter is required for /access_codes/list',
  })

  t.is(requestCount, 0)
})

test('SeamPaginator: fetches pages for a request with valid parameters', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })

  // UPSTREAM: The fake does not return a pagination object for this endpoint.
  nock(endpoint)
    .get('/access_codes/list')
    .query(true)
    .reply(200, {
      access_codes: [{ access_code_id: 'access-code-1' }],
      pagination: {
        has_next_page: false,
        next_page_cursor: null,
        next_page_url: null,
      },
    })

  const pages = seam.createPaginator(
    seam.accessCodes.list({ device_id: seed.august_device_1 }),
  )
  const [accessCodes, pagination] = await pages.firstPage()

  t.is(accessCodes.length, 1)
  t.false(pagination.hasNextPage)
})

test('SeamPaginator: instance allows iteration over all pages', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const allDevices = await seam.devices.list()
  const pages = seam.createPaginator(seam.devices.list({ limit: 1 }))

  const devices = []
  const allPages = []
  for await (const page of pages) {
    t.is(page.length, 1)
    allPages.push(page)
    devices.push(...page)
  }
  t.true(allPages.length > 1)
  t.true(devices.length > 1)
  t.is(devices.length, allDevices.length)
})
