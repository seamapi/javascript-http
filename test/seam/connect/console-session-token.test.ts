import test from 'ava'
import { getTestServer } from 'fixtures/seam/connect/api.js'
import jwt from 'jsonwebtoken'

import {
  SeamHttp,
  SeamHttpInvalidTokenError,
  SeamHttpMultiWorkspace,
} from '@seamapi/http/connect'

test('SeamHttp: fromConsoleSessionToken returns instance authorized with consoleSessionToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const consoleSessionToken = jwt.sign(
    {
      user_id: seed.john_user_id,
      key: seed.john_user_key,
    },
    'secret',
  )

  const seam = SeamHttp.fromConsoleSessionToken(
    consoleSessionToken,
    seed.seed_workspace_1,
    {
      endpoint,
    },
  )
  const device = await seam.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: constructor returns instance authorized with consoleSessionToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)

  const consoleSessionToken = jwt.sign(
    {
      user_id: seed.john_user_id,
      key: seed.john_user_key,
    },
    'secret',
  )

  const seam = new SeamHttp({
    consoleSessionToken,
    workspaceId: seed.seed_workspace_1,
    endpoint,
  })
  const device = await seam.devices.get({
    device_id: seed.august_device_1,
  })
  t.is(device.workspace_id, seed.seed_workspace_1)
  t.is(device.device_id, seed.august_device_1)
})

test('SeamHttp: checks consoleSessionToken format', (t) => {
  const workspaceId = 'e4203e37-e569-4a5a-bfb7-e3e8de66161d'
  t.throws(
    () =>
      SeamHttp.fromConsoleSessionToken('some-invalid-key-format', workspaceId),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(
    () => SeamHttp.fromConsoleSessionToken('seam_apikey_token', workspaceId),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(() => SeamHttp.fromConsoleSessionToken('seam_cst', workspaceId), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Client Session Token/,
  })
  t.throws(() => SeamHttp.fromConsoleSessionToken('seam_at', workspaceId), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Access Token/,
  })
})

test('SeamHttpMultiWorkspace: fromConsoleSessionToken returns instance authorized with consoleSessionToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const consoleSessionToken = jwt.sign(
    {
      user_id: seed.john_user_id,
      key: seed.john_user_key,
    },
    'secret',
  )

  const seam = SeamHttpMultiWorkspace.fromConsoleSessionToken(
    consoleSessionToken,
    {
      endpoint,
    },
  )
  const workspaces = await seam.workspaces.list()
  t.true(workspaces.length > 0)
})

test('SeamHttpMultiWorkspace: constructor returns instance authorized with consoleSessionToken', async (t) => {
  const { seed, endpoint } = await getTestServer(t)
  const consoleSessionToken = jwt.sign(
    {
      user_id: seed.john_user_id,
      key: seed.john_user_key,
    },
    'secret',
  )

  const seam = new SeamHttpMultiWorkspace({
    consoleSessionToken,
    endpoint,
  })
  const workspaces = await seam.workspaces.list()
  t.true(workspaces.length > 0)
})

test('SeamHttpMultiWorkspace: checks consoleSessionToken format', (t) => {
  t.throws(
    () =>
      SeamHttpMultiWorkspace.fromConsoleSessionToken('some-invalid-key-format'),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(
    () => SeamHttpMultiWorkspace.fromConsoleSessionToken('seam_apikey_token'),
    {
      instanceOf: SeamHttpInvalidTokenError,
      message: /Unknown/,
    },
  )
  t.throws(() => SeamHttpMultiWorkspace.fromConsoleSessionToken('seam_cst'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Client Session Token/,
  })
  t.throws(() => SeamHttpMultiWorkspace.fromConsoleSessionToken('seam_at'), {
    instanceOf: SeamHttpInvalidTokenError,
    message: /Access Token/,
  })
})
