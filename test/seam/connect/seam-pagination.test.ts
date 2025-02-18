import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp, SeamPaginator } from '@seamapi/http/connect'

test('SeamPaginator: creates a SeamPaginator', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const pages = seam.createPaginator(seam.devices.list())
  t.true(pages instanceof SeamPaginator)
})

test('SeamPaginator: fetches an array of devices', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const pages = seam.createPaginator(seam.devices.list())

  const devices = await pages.toArray()
  t.true(devices.length > 1)
})

test('SeamPaginator: flattens an array of devices', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const pages = seam.createPaginator(seam.devices.list())

  const devices = []
  for await (const device of pages.flatten()) {
    devices.push(device)
  }
  t.true(devices.length > 1)
})

test('SeamPaginator: Fetches an array of pages', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const pages = seam.createPaginator(seam.devices.list())

  const devices = []
  for await (const page of pages) {
    devices.push(page)
  }
  t.true(devices.length > 0)
})
