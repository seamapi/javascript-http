import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import { SeamHttp, SeamPaginator } from '@seamapi/http/connect'

test('SeamHttp: creates a SeamPaginator', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  const pages = seam.createPaginator(seam.devices.list())
  t.true(pages instanceof SeamPaginator)

  const devices = await pages.toArray()
  t.true(devices.length > 1)
})
