import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClientSessionToken,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClientSessionToken,
} from './client-options.js'

type Headers = Record<string, string>

export const getAuthHeaders = (options: SeamHttpOptions): Headers => {
  if (isSeamHttpOptionsWithApiKey(options)) {
    return getAuthHeadersForApiKey(options)
  }

  if (isSeamHttpOptionsWithClientSessionToken(options)) {
    return getAuthHeadersForClientSessionToken(options)
  }

  throw new SeamHttpInvalidOptionsError(
    'Must specify an apiKey or clientSessionToken',
  )
}

const getAuthHeadersForApiKey = ({
  apiKey,
}: SeamHttpOptionsWithApiKey): Headers => {
  if (isClientSessionToken(apiKey)) {
    throw new SeamHttpInvalidTokenError(
      'A Client Session Token cannot be used as an apiKey',
    )
  }

  if (isAccessToken(apiKey)) {
    throw new SeamHttpInvalidTokenError(
      'An access token cannot be used as an apiKey',
    )
  }

  if (isJwt(apiKey) || !isSeamToken(apiKey)) {
    throw new SeamHttpInvalidTokenError(
      `Unknown or invalid apiKey format, expected token to start with ${tokenPrefix}`,
    )
  }

  return {
    authorization: `Bearer ${apiKey}`,
  }
}

const getAuthHeadersForClientSessionToken = ({
  clientSessionToken,
}: SeamHttpOptionsWithClientSessionToken): Headers => {
  if (!isClientSessionToken(clientSessionToken)) {
    throw new SeamHttpInvalidTokenError(
      `Unknown or invalid clientSessionToken format, expected token to start with ${clientSessionTokenPrefix}`,
    )
  }

  return {
    authorization: `Bearer ${clientSessionToken}`,
    'client-session-token': clientSessionToken,
  }
}

export class SeamHttpInvalidTokenError extends Error {
  constructor(message: string) {
    super(`SeamHttp received an invalid token: ${message}`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

const tokenPrefix = 'seam_'

const clientSessionTokenPrefix = 'seam_cst'

const isClientSessionToken = (token: string): boolean =>
  token.startsWith(clientSessionTokenPrefix)

const isAccessToken = (token: string): boolean => token.startsWith('seam_at')

const isJwt = (token: string): boolean => token.startsWith('ey')

const isSeamToken = (token: string): boolean => token.startsWith(tokenPrefix)
