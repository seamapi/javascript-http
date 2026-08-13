import type { Client, ClientOptions } from './client.js'
import {
  isSeamHttpRequestOption,
  type SeamHttpRequestOptions,
} from './request-options.js'

export type { SeamHttpRequestOptions } from './request-options.js'

/**
 * Options for creating a SeamHttpWithoutWorkspace client,
 * which is not scoped to a single workspace.
 */
export type SeamHttpWithoutWorkspaceOptions =
  | SeamHttpWithoutWorkspaceOptionsFromEnv
  | SeamHttpWithoutWorkspaceOptionsWithClient
  | SeamHttpWithoutWorkspaceOptionsWithConsoleSessionToken
  | SeamHttpWithoutWorkspaceOptionsWithPersonalAccessToken

/**
 * Options for creating a SeamHttp client.
 */
export type SeamHttpOptions =
  | SeamHttpOptionsFromEnv
  | SeamHttpOptionsWithClient
  | SeamHttpOptionsWithApiKey
  | SeamHttpOptionsWithClientSessionToken
  | SeamHttpOptionsWithConsoleSessionToken
  | SeamHttpOptionsWithPersonalAccessToken

interface SeamHttpCommonOptions extends ClientOptions, SeamHttpRequestOptions {
  /**
   * The Seam API endpoint, e.g., `https://connect.getseam.com`.
   * Defaults to the SEAM_ENDPOINT or SEAM_API_URL environment variable, if set.
   */
  endpoint?: string
}

/**
 * Options for creating a SeamHttp client with `SeamHttp.fromPublishableKey`.
 */
export interface SeamHttpFromPublishableKeyOptions extends SeamHttpCommonOptions {}

/**
 * Options for creating a SeamHttp client that reads its configuration
 * from the environment, e.g., the SEAM_API_KEY environment variable.
 */
export interface SeamHttpOptionsFromEnv extends SeamHttpCommonOptions {}

/**
 * Options for creating a SeamHttpWithoutWorkspace client that reads
 * its configuration from the environment,
 * e.g., the SEAM_PERSONAL_ACCESS_TOKEN environment variable.
 */
export interface SeamHttpWithoutWorkspaceOptionsFromEnv extends SeamHttpCommonOptions {}

/**
 * Options for creating a SeamHttpWithoutWorkspace client from an existing client.
 */
export interface SeamHttpWithoutWorkspaceOptionsWithClient extends SeamHttpCommonOptions {
  /**
   * The existing client to use for requests.
   */
  client: Client
}

/**
 * Returns true if the options include a client.
 *
 * @throws {@link SeamHttpInvalidOptionsError} if the client option
 * is used with any other option.
 */
export const isSeamHttpWithoutWorkspaceOptionsWithClient = (
  options: SeamHttpOptions,
): options is SeamHttpWithoutWorkspaceOptionsWithClient =>
  isSeamHttpOptionsWithClient(options)

/**
 * Options for creating a SeamHttp client from an existing client.
 */
export interface SeamHttpOptionsWithClient extends SeamHttpRequestOptions {
  /**
   * The existing client to use for requests.
   */
  client: Client
}

/**
 * Returns true if the options include a client.
 *
 * @throws {@link SeamHttpInvalidOptionsError} if the client option
 * is used with any other option.
 */
export const isSeamHttpOptionsWithClient = (
  options: SeamHttpOptions,
): options is SeamHttpOptionsWithClient => {
  if (!('client' in options)) return false
  if (options.client == null) return false

  const keys = Object.keys(options).filter((k) => k !== 'client')
  if (keys.filter((k) => !isSeamHttpRequestOption(k)).length > 0) {
    throw new SeamHttpInvalidOptionsError(
      `The client option cannot be used with any other option, but received: ${keys.join(
        ', ',
      )}`,
    )
  }

  return true
}

/**
 * Options for creating a SeamHttp client authenticated with an API key.
 */
export interface SeamHttpOptionsWithApiKey extends SeamHttpCommonOptions {
  /**
   * The API key to use for authentication.
   */
  apiKey: string
}

/**
 * Returns true if the options include an apiKey.
 *
 * @throws {@link SeamHttpInvalidOptionsError} if the apiKey option
 * is used with another authentication option.
 */
export const isSeamHttpOptionsWithApiKey = (
  options: SeamHttpOptions,
): options is SeamHttpOptionsWithApiKey => {
  if (!('apiKey' in options)) return false
  if (options.apiKey == null) return false

  if ('clientSessionToken' in options && options.clientSessionToken != null) {
    throw new SeamHttpInvalidOptionsError(
      'The clientSessionToken option cannot be used with the apiKey option',
    )
  }

  if ('consoleSessionToken' in options && options.consoleSessionToken != null) {
    throw new SeamHttpInvalidOptionsError(
      'The consoleSessionToken option cannot be used with the apiKey option',
    )
  }

  if ('personalAccessToken' in options && options.personalAccessToken != null) {
    throw new SeamHttpInvalidOptionsError(
      'The personalAccessToken option cannot be used with the apiKey option',
    )
  }

  return true
}

/**
 * Options for creating a SeamHttp client authenticated with a client session token.
 */
export interface SeamHttpOptionsWithClientSessionToken extends SeamHttpCommonOptions {
  /**
   * The client session token to use for authentication.
   */
  clientSessionToken: string
}

/**
 * Returns true if the options include a clientSessionToken.
 *
 * @throws {@link SeamHttpInvalidOptionsError} if the clientSessionToken option
 * is used with another authentication option.
 */
export const isSeamHttpOptionsWithClientSessionToken = (
  options: SeamHttpOptions,
): options is SeamHttpOptionsWithClientSessionToken => {
  if (!('clientSessionToken' in options)) return false
  if (options.clientSessionToken == null) return false

  if ('apiKey' in options && options.apiKey != null) {
    throw new SeamHttpInvalidOptionsError(
      'The apiKey option cannot be used with the clientSessionToken option',
    )
  }

  if ('consoleSessionToken' in options && options.consoleSessionToken != null) {
    throw new SeamHttpInvalidOptionsError(
      'The consoleSessionToken option cannot be used with the clientSessionToken option',
    )
  }

  if ('personalAccessToken' in options && options.personalAccessToken != null) {
    throw new SeamHttpInvalidOptionsError(
      'The personalAccessToken option cannot be used with the clientSessionToken option',
    )
  }

  return true
}

/**
 * Options for creating a SeamHttpWithoutWorkspace client
 * authenticated with a console session token.
 */
export interface SeamHttpWithoutWorkspaceOptionsWithConsoleSessionToken extends SeamHttpCommonOptions {
  /**
   * The console session token to use for authentication.
   */
  consoleSessionToken: string
}

/**
 * Returns true if the options include a consoleSessionToken.
 *
 * @throws {@link SeamHttpInvalidOptionsError} if the consoleSessionToken option
 * is used with another authentication option.
 */
export const isSeamHttpWithoutWorkspaceOptionsWithConsoleSessionToken = (
  options: SeamHttpOptions,
): options is SeamHttpWithoutWorkspaceOptionsWithConsoleSessionToken => {
  if (!('consoleSessionToken' in options)) return false
  if (options.consoleSessionToken == null) return false

  if ('apiKey' in options && options.apiKey != null) {
    throw new SeamHttpInvalidOptionsError(
      'The apiKey option cannot be used with the consoleSessionToken option',
    )
  }

  if ('clientSessionToken' in options && options.clientSessionToken != null) {
    throw new SeamHttpInvalidOptionsError(
      'The clientSessionToken option cannot be used with the consoleSessionToken option',
    )
  }

  if ('personalAccessToken' in options && options.personalAccessToken != null) {
    throw new SeamHttpInvalidOptionsError(
      'The personalAccessToken option cannot be used with the consoleSessionToken option',
    )
  }

  return true
}

/**
 * Options for creating a SeamHttp client
 * authenticated with a console session token and scoped to a workspace.
 */
export interface SeamHttpOptionsWithConsoleSessionToken extends SeamHttpCommonOptions {
  /**
   * The console session token to use for authentication.
   */
  consoleSessionToken: string

  /**
   * The ID of the workspace to scope requests to.
   */
  workspaceId: string
}

/**
 * Returns true if the options include a consoleSessionToken and a workspaceId.
 *
 * @throws {@link SeamHttpInvalidOptionsError} if the consoleSessionToken option
 * is used with another authentication option or without the workspaceId option.
 */
export const isSeamHttpOptionsWithConsoleSessionToken = (
  options: SeamHttpOptions,
): options is SeamHttpOptionsWithConsoleSessionToken => {
  if (!isSeamHttpWithoutWorkspaceOptionsWithConsoleSessionToken(options)) {
    return false
  }

  if (!('workspaceId' in options) || options.workspaceId == null) {
    throw new SeamHttpInvalidOptionsError(
      'Must pass a workspaceId when using a consoleSessionToken',
    )
  }

  return true
}

/**
 * Options for creating a SeamHttpWithoutWorkspace client
 * authenticated with a personal access token.
 */
export interface SeamHttpWithoutWorkspaceOptionsWithPersonalAccessToken extends SeamHttpCommonOptions {
  /**
   * The personal access token to use for authentication.
   */
  personalAccessToken: string
}

/**
 * Returns true if the options include a personalAccessToken.
 *
 * @throws {@link SeamHttpInvalidOptionsError} if the personalAccessToken option
 * is used with another authentication option.
 */
export const isSeamHttpWithoutWorkspaceOptionsWithPersonalAccessToken = (
  options: SeamHttpOptions,
): options is SeamHttpWithoutWorkspaceOptionsWithPersonalAccessToken => {
  if (!('personalAccessToken' in options)) return false
  if (options.personalAccessToken == null) return false

  if ('apiKey' in options && options.apiKey != null) {
    throw new SeamHttpInvalidOptionsError(
      'The apiKey option cannot be used with the personalAccessToken option',
    )
  }

  if ('clientSessionToken' in options && options.clientSessionToken != null) {
    throw new SeamHttpInvalidOptionsError(
      'The clientSessionToken option cannot be used with the personalAccessToken option',
    )
  }

  if ('consoleSessionToken' in options && options.consoleSessionToken != null) {
    throw new SeamHttpInvalidOptionsError(
      'The consoleSessionToken option cannot be used with the personalAccessToken option',
    )
  }

  return true
}

/**
 * Options for creating a SeamHttp client
 * authenticated with a personal access token and scoped to a workspace.
 */
export interface SeamHttpOptionsWithPersonalAccessToken extends SeamHttpCommonOptions {
  /**
   * The personal access token to use for authentication.
   */
  personalAccessToken: string

  /**
   * The ID of the workspace to scope requests to.
   */
  workspaceId: string
}

/**
 * Returns true if the options include a personalAccessToken and a workspaceId.
 *
 * @throws {@link SeamHttpInvalidOptionsError} if the personalAccessToken option
 * is used with another authentication option or without the workspaceId option.
 */
export const isSeamHttpOptionsWithPersonalAccessToken = (
  options: SeamHttpOptions,
): options is SeamHttpOptionsWithPersonalAccessToken => {
  if (!isSeamHttpWithoutWorkspaceOptionsWithPersonalAccessToken(options)) {
    return false
  }

  if (!('workspaceId' in options) || options.workspaceId == null) {
    throw new SeamHttpInvalidOptionsError(
      'Must pass a workspaceId when using a personalAccessToken',
    )
  }

  return true
}

/**
 * Error thrown when a SeamHttp client is created with invalid options.
 */
export class SeamHttpInvalidOptionsError extends Error {
  constructor(message: string) {
    super(`SeamHttp received invalid options: ${message}`)
    this.name = this.constructor.name
  }
}

/**
 * Error thrown when a SeamHttpWithoutWorkspace client is created with invalid options.
 */
export class SeamHttpWithoutWorkspaceInvalidOptionsError extends Error {
  constructor(message: string) {
    super(`SeamHttpWithoutWorkspace received invalid options: ${message}`)
    this.name = this.constructor.name
  }
}
