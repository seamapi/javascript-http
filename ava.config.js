import { env } from 'node:process'

export default () => {
  delete env.SEAM_API_KEY
  delete env.SEAM_ENDPOINT
  delete env.SEAM_API_URL

  return {
    files: ['**/*.test.ts', '!package/**/*'],
    ignoreChanges: {
      watchMode: ['tmp/**/*'],
    },
    extensions: {
      ts: 'commonjs',
    },
    nodeArguments: ['--import=tsx'],
  }
}
