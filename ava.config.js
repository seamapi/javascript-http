import { env } from 'node:process'

export default () => {
  delete env.SEAM_API_KEY
  delete env.SEAM_ENDPOINT
  delete env.SEAM_API_URL

  return {
    ignoredByWatcher: ['tmp/**/*'],
    files: ['**/*.test.ts', '!package/**/*'],
    extensions: {
      ts: 'commonjs'
    },
    nodeArguments: ['--import=tsx']
  }
}
