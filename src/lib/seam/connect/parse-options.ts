import version from 'lib/version.js'

import { getAuthHeaders } from './auth.js'
import type { Client, ClientOptions } from './client.js'
import {
  isSeamHttpMultiWorkspaceOptionsWithClient,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  type SeamHttpMultiWorkspaceOptions,
  type SeamHttpOptions,
} from './options.js'

const defaultEndpoint = 'https://connect.getseam.com'

const sdkHeaders = {
  'seam-sdk-name': 'seamapi/javascript-http',
  'seam-sdk-version': version,
}

export type Options =
  | SeamHttpMultiWorkspaceOptions
  | (SeamHttpOptions & { publishableKey?: string })

export const parseOptions = (
  apiKeyOrOptions: string | Options,
): ClientOptions | { client: Client } => {
  const options = getNormalizedOptions(apiKeyOrOptions)

  if (isSeamHttpOptionsWithClient(options)) return options
  if (isSeamHttpMultiWorkspaceOptionsWithClient(options)) return options

  return {
    axiosOptions: {
      baseURL: options.endpoint ?? getEndpointFromEnv() ?? defaultEndpoint,
      withCredentials: isSeamHttpOptionsWithClientSessionToken(options),
      ...options.axiosOptions,
      headers: {
        ...getAuthHeaders(options),
        ...options.axiosOptions?.headers,
        ...sdkHeaders,
      },
    },
    axiosRetryOptions: {
      ...options.axiosRetryOptions,
    },
  }
}

const getNormalizedOptions = (
  apiKeyOrOptions: string | Options,
): SeamHttpOptions => {
  const options =
    typeof apiKeyOrOptions === 'string'
      ? { apiKey: apiKeyOrOptions }
      : apiKeyOrOptions

  if (isSeamHttpOptionsWithClient(options)) return options

  const apiKey =
    'apiKey' in options ? options.apiKey : getApiKeyFromEnv(options)

  return {
    ...options,
    ...(apiKey != null ? { apiKey } : {}),
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
