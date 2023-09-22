import test from 'ava'

import { SeamHttp } from './client.js'

test('SeamHttp: fromApiKey', (t) => {
  t.truthy(SeamHttp.fromApiKey('seam_some-api-key'))
})
