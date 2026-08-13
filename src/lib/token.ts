export const tokenPrefix = 'seam_'

export const accessTokenPrefix = 'seam_at'

export const jwtPrefix = 'ey'

export const clientSessionTokenPrefix = 'seam_cst'

export const publishableKeyTokenPrefix = 'seam_pk'

/**
 * Returns true if the token is a Seam access token.
 */
export const isAccessToken = (token: string): boolean =>
  token.startsWith(accessTokenPrefix)

/**
 * Returns true if the token is a JSON Web Token (JWT).
 */
export const isJwt = (token: string): boolean => token.startsWith(jwtPrefix)

/**
 * Returns true if the token is any type of Seam token.
 */
export const isSeamToken = (token: string): boolean =>
  token.startsWith(tokenPrefix)

/**
 * Returns true if the token is a Seam API key.
 */
export const isApiKey = (token: string): boolean =>
  !isClientSessionToken(token) &&
  !isJwt(token) &&
  !isAccessToken(token) &&
  !isPublishableKey(token) &&
  isSeamToken(token)

/**
 * Returns true if the token is a Seam client session token.
 */
export const isClientSessionToken = (token: string): boolean =>
  token.startsWith(clientSessionTokenPrefix)

/**
 * Returns true if the token is a Seam publishable key.
 */
export const isPublishableKey = (token: string): boolean =>
  token.startsWith(publishableKeyTokenPrefix)

/**
 * Returns true if the token may be used as a console session token.
 */
export const isConsoleSessionToken = (token: string): boolean => isJwt(token)

/**
 * Returns true if the token may be used as a personal access token.
 */
export const isPersonalAccessToken = (token: string): boolean =>
  isAccessToken(token)
