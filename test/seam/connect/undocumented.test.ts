import test from 'ava'
import { AxiosError } from 'axios'
import { getTestServer } from 'fixtures/seam/connect/api.js'

import {
  SeamHttp,
  SeamHttpAcsAccessGroupsUnmanaged,
  SeamHttpEndpoints,
} from '@seamapi/http/connect'

test('SeamHttp: must use isUndocumentedApiEnabled to use undocumented route', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  t.throws(() => seam.acs.accessGroups.unmanaged, {
    message: /Cannot use undocumented/,
  })
  const seamUndocumented = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    isUndocumentedApiEnabled: true,
  })
  t.truthy(seamUndocumented.acs.accessGroups.unmanaged)
})

test('SeamHttp: must use isUndocumentedApiEnabled to use undocumented endpoint', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttp.fromApiKey(seed.seam_apikey1_token, { endpoint })
  t.truthy(seam.devices)
  await t.throwsAsync(
    async () => {
      await seam.devices.delete()
    },
    {
      message: /Cannot use undocumented/,
    },
  )
  const seamUndocumented = SeamHttp.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
    isUndocumentedApiEnabled: true,
  })
  t.truthy(seamUndocumented.devices)
  await seamUndocumented.devices.delete({ device_id: seed.august_device_1 })
  t.pass()
})

test('SeamHttpAcsAccessGroupsUnmanaged: must use isUndocumentedApiEnabled', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  t.throws(
    () => {
      SeamHttpAcsAccessGroupsUnmanaged.fromApiKey(seed.seam_apikey1_token, {
        endpoint,
      })
    },
    { message: /Cannot use undocumented/ },
  )
  t.truthy(
    SeamHttpAcsAccessGroupsUnmanaged.fromApiKey(seed.seam_apikey1_token, {
      endpoint,
      isUndocumentedApiEnabled: true,
    }),
  )
})

test('SeamHttpEndpoints: cannot use undocumented endpoint', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const seam = SeamHttpEndpoints.fromApiKey(seed.seam_apikey1_token, {
    endpoint,
  })
  await t.throwsAsync(
    async () => {
      await seam['/acs/access_groups/unmanaged/list']()
    },
    { message: /Cannot use undocumented/ },
  )
  const seamUndocumented = SeamHttpEndpoints.fromApiKey(
    seed.seam_apikey1_token,
    {
      endpoint,
      isUndocumentedApiEnabled: true,
    },
  )
  await t.throwsAsync(
    async () => {
      await seamUndocumented['/acs/access_groups/unmanaged/list']()
    },
    {
      instanceOf: AxiosError,
    },
  )
})

test.todo(
  'SeamHttpMultiWorkspace: must use isUndocumentedApiEnabled to use undocumented route',
)
test.todo(
  'SeamHttpMultiWorkspace: must use isUndocumentedApiEnabled to use undocumented endpoint',
)
