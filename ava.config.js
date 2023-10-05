import { env } from 'node:process'

export default () => {
  delete env.SEAM_API_KEY
  delete env.SEAM_ENDPOINT
  delete env.SEAM_API_URL

  return {
    ignoredByWatcher: ['tmp/**/*'],
    files: ['**/*.test.ts', '!package/**/*'],
    environmentVariables: {
      // UPSTREAM: https://nodejs.org/docs/latest-v18.x/api/esm.html#loaders
      NODE_NO_WARNINGS: '1',
    },
    extensions: {
      ts: 'module',
    },
    nodeArguments: ['--loader=tsx'],
  }
}
