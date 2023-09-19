import type {
  SeamHttpOptionsWithApiKey,
  SeamHttpOptionsWithClientSessionToken,
} from './client-options.js'

type Headers = Record<string, string>

export const getAuthHeadersForApiKey = ({
  apiKey,
}: SeamHttpOptionsWithApiKey): Headers => {
  if (isClientSessionToken(apiKey)) {
    throw new InvalidSeamTokenError(
      'A Client Session Token cannot be used as an apiKey',
    )
  }

  if (isAccessToken(apiKey)) {
    throw new InvalidSeamTokenError(
      'An access token cannot be used as an apiKey without specifying a workspaceId',
    )
  }

  if (isJwt(apiKey) || !isSeamToken(apiKey)) {
    throw new InvalidSeamTokenError(
      `Unknown or Invalid apiKey format, expected token to start with ${tokenPrefix}`,
    )
  }

  return {
    authorization: `Bearer ${apiKey}`,
  }
}

export const getAuthHeadersForClientSessionToken = ({
  clientSessionToken,
}: SeamHttpOptionsWithClientSessionToken): Headers => {
  if (!isClientSessionToken(clientSessionToken)) {
    throw new InvalidSeamTokenError(
      `Unknown or invalid clientSessionToken format, expected token to start with ${clientSessionTokenPrefix}`,
    )
  }

  return {
    authorization: `Bearer ${clientSessionToken}`,
    'client-session-token': clientSessionToken,
  }
}

export class InvalidSeamTokenError extends Error {
  constructor(message: string) {
    super(`SeamHttp received an authorization invalid token: ${message}`)
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
