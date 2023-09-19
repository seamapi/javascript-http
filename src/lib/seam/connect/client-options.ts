import type { AxiosRequestConfig } from 'axios'

export type SeamHttpOptions =
  | SeamHttpOptionsWithApiKey
  | SeamHttpOptionsWithClientSessionToken

interface SeamHttpCommonOptions {
  endpoint?: string
  axiosOptions?: AxiosRequestConfig
}

export interface SeamHttpOptionsWithApiKey extends SeamHttpCommonOptions {
  apiKey: string
}

export const isSeamHttpOptionsWithApiKey = (
  options: SeamHttpOptions,
): options is SeamHttpOptionsWithApiKey => {
  if (!('apiKey' in options)) return false

  if ('clientSessionToken' in options && options.clientSessionToken != null) {
    throw new InvalidSeamHttpOptionsError(
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

  if ('apiKey' in options && options.apiKey != null) {
    throw new InvalidSeamHttpOptionsError(
      'The clientSessionToken option cannot be used with the apiKey option.',
    )
  }

  return true
}

export class InvalidSeamHttpOptionsError extends Error {
  constructor(message: string) {
    super(`SeamHttp received invalid options: ${message}`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
