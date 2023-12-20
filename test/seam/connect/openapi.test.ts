import { openapi } from '@seamapi/types/connect'
import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'
import nock from 'nock'

import { getOpenapiSchema } from '@seamapi/http/connect'

test('SeamHttp: getOpenapiSchema returns data', async (t) => {
  const { endpoint } = await getTestServer(t)

  // UPSTREAM: Must use nock since fake-seam-connect returns 404 for /openapi.json.
  // https://github.com/seamapi/fake-seam-connect/issues/132
  nock(endpoint).get('/openapi.json').reply(200, openapi)

  const data = await getOpenapiSchema(endpoint)
  t.truthy(data.info.title)
})
