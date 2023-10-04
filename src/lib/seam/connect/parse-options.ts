import {
  isSeamHttpOptionsWithClient,
  type SeamHttpOptions,
} from './client-options.js'

const enableLegacyMethodBehaivorDefault = true

export const parseOptions = (
  apiKeyOrOptions: string | SeamHttpOptions,
): Required<SeamHttpOptions> => {
  const options =
    typeof apiKeyOrOptions === 'string'
      ? { apiKey: apiKeyOrOptions }
      : apiKeyOrOptions

  if (isSeamHttpOptionsWithClient(options))
    return {
      ...options,
      enableLegacyMethodBehaivor:
        options.enableLegacyMethodBehaivor ?? enableLegacyMethodBehaivorDefault,
    }

  const endpoint =
    options.endpoint ??
    globalThis.process?.env?.SEAM_ENDPOINT ??
    globalThis.process?.env?.SEAM_API_URL ??
    'https://connect.getseam.com'

  const apiKey =
    'apiKey' in options
      ? options.apiKey
      : globalThis.process?.env?.SEAM_API_KEY

  return {
    ...options,
    ...(apiKey != null ? { apiKey } : {}),
    endpoint,
    axiosOptions: options.axiosOptions ?? {},
    enableLegacyMethodBehaivor:
      options.enableLegacyMethodBehaivor ?? enableLegacyMethodBehaivorDefault,
  }
}
