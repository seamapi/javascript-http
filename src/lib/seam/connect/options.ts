import type { Axios, AxiosRequestConfig } from 'axios'
import type { AxiosRetry } from 'axios-retry'

export type SeamHttpOptions =
  | SeamHttpOptionsFromEnv
  | SeamHttpOptionsWithClient
  | SeamHttpOptionsWithApiKey
  | SeamHttpOptionsWithClientSessionToken

interface SeamHttpCommonOptions {
  endpoint?: string
  axiosOptions?: AxiosRequestConfig
  axiosRetryOptions?: AxiosRetryConfig
  enableLegacyMethodBehaivor?: boolean
}

type AxiosRetryConfig = Parameters<AxiosRetry>[1]

export type SeamHttpOptionsFromEnv = SeamHttpCommonOptions

export interface SeamHttpOptionsWithClient
  extends Pick<SeamHttpCommonOptions, 'enableLegacyMethodBehaivor'> {
  client: Axios
}

export const isSeamHttpOptionsWithClient = (
  options: SeamHttpOptions,
): options is SeamHttpOptionsWithClient => {
  if (!('client' in options)) return false
  if (options.client == null) return false

  const keys = Object.keys(options).filter(
    (k) => !['client', 'enableLegacyMethodBehaivor'].includes(k),
  )
  if (keys.length > 0) {
    throw new SeamHttpInvalidOptionsError(
      `The client option cannot be used with any other option except enableLegacyMethodBehaivor, but received: ${keys.join(
        ', ',
      )}`,
    )
  }

  return true
}

export interface SeamHttpOptionsWithApiKey extends SeamHttpCommonOptions {
  apiKey: string
}

export const isSeamHttpOptionsWithApiKey = (
  options: SeamHttpOptions,
): options is SeamHttpOptionsWithApiKey => {
  if (!('apiKey' in options)) return false
  if (options.apiKey == null) return false

  if ('clientSessionToken' in options && options.clientSessionToken != null) {
    throw new SeamHttpInvalidOptionsError(
      'The clientSessionToken option cannot be used with the apiKey option.',
    )
  }

  return true
}

export interface SeamHttpOptionsWithClientSessionToken
  extends SeamHttpCommonOptions {
  clientSessionToken: string
}

export const isSeamHttpOptionsWithClientSessionToken = (
  options: SeamHttpOptions,
): options is SeamHttpOptionsWithClientSessionToken => {
  if (!('clientSessionToken' in options)) return false
  if (options.clientSessionToken == null) return false

  if ('apiKey' in options && options.apiKey != null) {
    throw new SeamHttpInvalidOptionsError(
      'The clientSessionToken option cannot be used with the apiKey option.',
    )
  }

  return true
}

export class SeamHttpInvalidOptionsError extends Error {
  constructor(message: string) {
    super(`SeamHttp received invalid options: ${message}`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
