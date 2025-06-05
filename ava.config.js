import { env } from 'node:process'

export default () => {
  delete env.SEAM_API_KEY
  delete env.SEAM_ENDPOINT
  delete env.SEAM_API_URL
  delete env.SEAM_PERSONAL_ACCESS_TOKEN
  delete env.SEAM_WORKSPACE_ID

  return {
    ignoredByWatcher: ['tmp/**/*'],
    files: ['**/*.test.ts', '!package/**/*'],
    extensions: {
      ts: 'commonjs',
    },
    nodeArguments: ['--import=tsx'],
  }
}
