import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClientSessionToken,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClientSessionToken,
} from './options.js'

type Headers = Record<string, string>

export const getAuthHeaders = (
  options: SeamHttpOptions | { publishableKey: string },
): Headers => {
  if ('publishableKey' in options) {
    return getAuthHeadersForPublishableKey(options.publishableKey)
  }

  if (isSeamHttpOptionsWithApiKey(options)) {
    return getAuthHeadersForApiKey(options)
  }

  if (isSeamHttpOptionsWithClientSessionToken(options)) {
    return getAuthHeadersForClientSessionToken(options)
  }

  throw new SeamHttpInvalidOptionsError(
    'Must specify an apiKey, clientSessionToken, or publishableKey',
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

  if (isJwt(apiKey)) {
    throw new SeamHttpInvalidTokenError('A JWT cannot be used as an apiKey')
  }

  if (isAccessToken(apiKey)) {
    throw new SeamHttpInvalidTokenError(
      'An Access Token cannot be used as an apiKey',
    )
  }

  if (!isSeamToken(apiKey)) {
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
  if (isJwt(clientSessionToken)) {
    throw new SeamHttpInvalidTokenError(
      'A JWT cannot be used as a clientSessionToken',
    )
  }

  if (isAccessToken(clientSessionToken)) {
    throw new SeamHttpInvalidTokenError(
      'An Access Token cannot be used as a clientSessionToken',
    )
  }

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

const getAuthHeadersForPublishableKey = (publishableKey: string): Headers => {
  return {
    'seam-publishable-key': publishableKey,
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
