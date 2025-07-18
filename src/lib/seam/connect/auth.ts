import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClientSessionToken,
  isSeamHttpOptionsWithConsoleSessionToken,
  isSeamHttpOptionsWithPersonalAccessToken,
  isSeamHttpWithoutWorkspaceOptionsWithConsoleSessionToken,
  isSeamHttpWithoutWorkspaceOptionsWithPersonalAccessToken,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClientSessionToken,
  type SeamHttpOptionsWithConsoleSessionToken,
  type SeamHttpOptionsWithPersonalAccessToken,
  type SeamHttpWithoutWorkspaceOptionsWithConsoleSessionToken,
  type SeamHttpWithoutWorkspaceOptionsWithPersonalAccessToken,
} from './options.js'
import type { Options } from './parse-options.js'
import {
  accessTokenPrefix,
  clientSessionTokenPrefix,
  isAccessToken,
  isClientSessionToken,
  isJwt,
  isPublishableKey,
  isSeamToken,
  jwtPrefix,
  publishableKeyTokenPrefix,
  tokenPrefix,
} from './token.js'

type Headers = Record<string, string>

export const getAuthHeaders = (options: Options): Headers => {
  if ('publishableKey' in options && options.publishableKey != null) {
    return getAuthHeadersForPublishableKey(options.publishableKey)
  }

  if (isSeamHttpOptionsWithApiKey(options)) {
    return getAuthHeadersForApiKey(options)
  }

  if (isSeamHttpOptionsWithClientSessionToken(options)) {
    return getAuthHeadersForClientSessionToken(options)
  }

  if (
    isSeamHttpWithoutWorkspaceOptionsWithConsoleSessionToken(options) ||
    isSeamHttpOptionsWithConsoleSessionToken(options)
  ) {
    return getAuthHeadersForConsoleSessionToken(options)
  }

  if (
    isSeamHttpWithoutWorkspaceOptionsWithPersonalAccessToken(options) ||
    isSeamHttpOptionsWithPersonalAccessToken(options)
  ) {
    return getAuthHeadersForPersonalAccessToken(options)
  }

  throw new SeamHttpInvalidOptionsError(
    [
      'Must specify',
      'an apiKey,',
      'clientSessionToken,',
      'publishableKey,',
      'consoleSessionToken',
      'or personalAccessToken.',
      'Attempted reading configuration from the environment, but the environment variable SEAM_API_KEY is not set.',
    ].join(' '),
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

  if (isPublishableKey(apiKey)) {
    throw new SeamHttpInvalidTokenError(
      'A Publishable Key cannot be used as an apiKey',
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

export const getAuthHeadersForClientSessionToken = ({
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

  if (isPublishableKey(clientSessionToken)) {
    throw new SeamHttpInvalidTokenError(
      'A Publishable Key cannot be used as a clientSessionToken',
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

const getAuthHeadersForConsoleSessionToken = ({
  consoleSessionToken,
  ...options
}:
  | SeamHttpWithoutWorkspaceOptionsWithConsoleSessionToken
  | SeamHttpOptionsWithConsoleSessionToken): Headers => {
  const workspaceId = 'workspaceId' in options ? options.workspaceId : undefined

  if (isAccessToken(consoleSessionToken)) {
    throw new SeamHttpInvalidTokenError(
      'An Access Token cannot be used as a consoleSessionToken',
    )
  }

  if (isClientSessionToken(consoleSessionToken)) {
    throw new SeamHttpInvalidTokenError(
      'A Client Session Token cannot be used as a consoleSessionToken',
    )
  }

  if (isPublishableKey(consoleSessionToken)) {
    throw new SeamHttpInvalidTokenError(
      'A Publishable Key cannot be used as a consoleSessionToken',
    )
  }

  if (!isJwt(consoleSessionToken)) {
    throw new SeamHttpInvalidTokenError(
      `Unknown or invalid consoleSessionToken format, expected a JWT which starts with ${jwtPrefix}`,
    )
  }

  return {
    authorization: `Bearer ${consoleSessionToken}`,
    ...(workspaceId != null ? { 'seam-workspace': workspaceId } : {}),
  }
}

const getAuthHeadersForPersonalAccessToken = ({
  personalAccessToken,
  ...options
}:
  | SeamHttpWithoutWorkspaceOptionsWithPersonalAccessToken
  | SeamHttpOptionsWithPersonalAccessToken): Headers => {
  const workspaceId = 'workspaceId' in options ? options.workspaceId : undefined

  if (isJwt(personalAccessToken)) {
    throw new SeamHttpInvalidTokenError(
      'A JWT cannot be used as a personalAccessToken',
    )
  }

  if (isClientSessionToken(personalAccessToken)) {
    throw new SeamHttpInvalidTokenError(
      'A Client Session Token cannot be used as a personalAccessToken',
    )
  }

  if (isPublishableKey(personalAccessToken)) {
    throw new SeamHttpInvalidTokenError(
      'A Publishable Key cannot be used as a personalAccessToken',
    )
  }

  if (!isAccessToken(personalAccessToken)) {
    throw new SeamHttpInvalidTokenError(
      `Unknown or invalid personalAccessToken format, expected token to start with ${accessTokenPrefix}`,
    )
  }

  return {
    authorization: `Bearer ${personalAccessToken}`,
    ...(workspaceId != null ? { 'seam-workspace': workspaceId } : {}),
  }
}

const getAuthHeadersForPublishableKey = (publishableKey: string): Headers => {
  if (isJwt(publishableKey)) {
    throw new SeamHttpInvalidTokenError(
      'A JWT cannot be used as a publishableKey',
    )
  }

  if (isAccessToken(publishableKey)) {
    throw new SeamHttpInvalidTokenError(
      'An Access Token cannot be used as a publishableKey',
    )
  }

  if (isClientSessionToken(publishableKey)) {
    throw new SeamHttpInvalidTokenError(
      'A Client Session Token Key cannot be used as a publishableKey',
    )
  }

  if (!isPublishableKey(publishableKey)) {
    throw new SeamHttpInvalidTokenError(
      `Unknown or invalid publishableKey format, expected token to start with ${publishableKeyTokenPrefix}`,
    )
  }

  return {
    'seam-publishable-key': publishableKey,
  }
}

export class SeamHttpInvalidTokenError extends Error {
  constructor(message: string) {
    super(`SeamHttp received an invalid token: ${message}`)
    this.name = this.constructor.name
  }
}

export const warnOnInsecureuserIdentifierKey = (
  userIdentifierKey: string,
): void => {
  if (isEmail(userIdentifierKey)) {
    // eslint-disable-next-line no-console
    console.warn(
      ...[
        'Using an email for the userIdentifierKey is insecure and may return an error in the future!',
        'This is insecure because an email is common knowledge or easily guessed.',
        'Use something with sufficient entropy known only to the owner of the client session.',
        'For help choosing a user identifier key see',
        'https://docs.seam.co/latest/seam-components/overview/get-started-with-client-side-components#3-select-a-user-identifier-key',
      ],
    )
  }
}

// SOURCE: https://stackoverflow.com/a/46181
const isEmail = (value: string): boolean => {
  if (value.includes('!')) return false
  // The regex may run slow on strings starting with '!@!.' and with many repetitions of '!.'.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
