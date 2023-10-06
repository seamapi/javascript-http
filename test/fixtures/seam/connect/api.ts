import {
  createFake,
  type Database,
  type Seed,
} from '@seamapi/fake-seam-connect'
import type { ExecutionContext } from 'ava'
import fetch from 'node-fetch' // TODO: Remove node-fetch when Node v16 support is dropped.

export const getTestServer = async (
  t: ExecutionContext,
): Promise<{
  endpoint: string
  seed: Seed
  db: Database
}> => {
  const fake = await createFake()
  const seed = await fake.seed()

  await fake.startServer()
  t.teardown(async () => {
    await fake.stopServer()
  })

  const endpoint = fake.serverUrl
  if (endpoint == null) throw new Error('Fake endpoint is null')
  const res = await fetch(`${endpoint}/health`)
  if (!res.ok) throw new Error('Fake Seam Connect unhealthy')

  return {
    endpoint,
    seed,
    db: fake.database,
  }
}
