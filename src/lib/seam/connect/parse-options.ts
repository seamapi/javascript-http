import { isSeamHttpOptionsWithClient, type SeamHttpOptions } from './options.js'

const defaultEndpoint = 'https://connect.getseam.com'

export const parseOptions = (
  apiKeyOrOptions: string | SeamHttpOptions,
): Required<SeamHttpOptions> => {
  const options =
    typeof apiKeyOrOptions === 'string'
      ? { apiKey: apiKeyOrOptions }
      : apiKeyOrOptions

  if (isSeamHttpOptionsWithClient(options)) return options

  const endpoint = options.endpoint ?? getEndpointFromEnv() ?? defaultEndpoint

  const apiKey =
    'apiKey' in options ? options.apiKey : getApiKeyFromEnv(options)

  return {
    ...options,
    ...(apiKey != null ? { apiKey } : {}),
    endpoint,
    axiosOptions: options.axiosOptions ?? {},
    axiosRetryOptions: options.axiosRetryOptions ?? {},
  }
}

const getApiKeyFromEnv = (
  options: SeamHttpOptions,
): string | null | undefined => {
  if ('clientSessionToken' in options && options.clientSessionToken != null) {
    return null
  }
  return globalThis.process?.env?.SEAM_API_KEY
}

const getEndpointFromEnv = (): string | null | undefined => {
  return (
    globalThis.process?.env?.SEAM_ENDPOINT ??
    globalThis.process?.env?.SEAM_API_URL
  )
}
