import test from 'ava'

import { SeamHttp } from '@seamapi/http/connect'

test('SeamHttp: fromApiKey', (t) => {
  t.truthy(SeamHttp.fromApiKey('seam_some-api-key'))
})
