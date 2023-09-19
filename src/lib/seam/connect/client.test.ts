import test from 'ava'

import { SeamHttp } from './client.js'

test('SeamHttp: fromApiKey', (t) => {
  t.truthy(SeamHttp.fromApiKey('some-api-key'))
})
