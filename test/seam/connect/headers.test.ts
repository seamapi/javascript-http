import test from 'ava'
import { randomUUID } from 'crypto'
import { getTestServer } from 'fixtures/seam/connect/api.js'
import nock from 'nock'

import { SeamHttp } from '@seamapi/http/connect'

import seamapiJavascriptHttpVersion from 'lib/version.js'

test('SeamHttp: sends default headers', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const deviceId = randomUUID()
  nock(endpoint, {
    reqheaders: {
      'seam-sdk-name': 'seamapi/javascript-http',
      'seam-lts-version': SeamHttp.ltsVersion,
      'seam-sdk-version': seamapiJavascriptHttpVersion,
    },
  })
    .post('/devices/get', { device_id: deviceId })
    .reply(200, { device: { device_id: deviceId } })
  const seam = new SeamHttp({ apiKey: seed.seam_apikey1_token, endpoint })
  const device = await seam.devices.get({
    device_id: deviceId,
  })
  t.is(SeamHttp.ltsVersion, seam.ltsVersion)
  t.is(device.device_id, deviceId)
})
