import type { Method } from 'axios'

import type { Client } from './client.js'
import type { SeamHttpRequestOptions } from './options.js'
import { assertValidRequestParameters } from './request-parameters.js'
import {
  type ActionAttemptsClient,
  resolveActionAttempt,
} from './resolve-action-attempt.js'
import type { ActionAttempt } from './resources/action-attempt.js'
import { SeamHttpInvalidResponseError } from './seam-http-error.js'
import { serializeUrlSearchParams } from './url-search-params-serializer.js'

interface SeamHttpRequestParent {
  readonly client: Client
  readonly defaults: Required<SeamHttpRequestOptions>
}

interface SeamHttpRequestConfig<TResponseKey> {
  readonly pathname: string
  readonly method: Method
  readonly body?: unknown
  readonly params?: undefined | Record<string, unknown>
  readonly responseKey: TResponseKey
  readonly hasPagination?: boolean
  readonly options?: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'>
  readonly actionAttempts?: ActionAttemptsClient
  readonly parameters?: unknown
  readonly hasRequiredParameters?: boolean
  readonly requiredParameterNames?: readonly string[]
}

/**
 * A lazy request to the Seam API.
 *
 * Creating a SeamHttpRequest does not send anything over the network.
 * The request is sent once `execute` is called,
 * or when the request is awaited like a Promise,
 * e.g., with `await`, `then`, `catch`, or `finally`.
 * When the response contains an action attempt,
 * awaiting the request also waits for the action attempt to resolve
 * according to the `waitForActionAttempt` option.
 *
 * Before sending, the request may be inspected
 * with `url`, `pathname`, `method`, `params`, and `body`.
 */
export class SeamHttpRequest<
  const TResponse,
  const TResponseKey extends keyof TResponse | undefined,
> implements Promise<
  TResponseKey extends keyof TResponse ? TResponse[TResponseKey] : undefined
> {
  readonly [Symbol.toStringTag]: string = 'SeamHttpRequest'

  readonly #parent: SeamHttpRequestParent
  readonly #config: SeamHttpRequestConfig<TResponseKey>

  constructor(
    parent: SeamHttpRequestParent,
    config: SeamHttpRequestConfig<TResponseKey>,
  ) {
    this.#parent = parent
    this.#config = config
  }

  /**
   * The key of the API response object containing the response data,
   * or undefined if the endpoint returns an empty response.
   */
  public get responseKey(): TResponseKey {
    return this.#config.responseKey
  }

  public get hasPagination(): boolean {
    return this.#config.hasPagination ?? false
  }

  /**
   * The full request URL including any serialized query parameters.
   */
  public get url(): URL {
    const { client } = this.#parent

    const serializer =
      typeof client.defaults.paramsSerializer === 'function'
        ? client.defaults.paramsSerializer
        : serializeUrlSearchParams

    const origin = getUrlPrefix(client.defaults.baseURL ?? '')

    const path =
      this.params == null
        ? this.pathname
        : `${this.pathname}?${serializer(this.params)}`

    return new URL(`${origin}${path}`)
  }

  public get pathname(): string {
    return this.#config.pathname.startsWith('/')
      ? this.#config.pathname
      : `/${this.#config.pathname}`
  }

  public get method(): Method {
    return this.#config.method
  }

  public get params(): undefined | Record<string, unknown> {
    return this.#config.params
  }

  public get body(): unknown {
    return this.#config.body
  }

  /**
   * Sends the request and returns the response data.
   * If the response contains an action attempt,
   * waits for the action attempt to resolve
   * according to the `waitForActionAttempt` option.
   */
  async execute(): Promise<
    TResponseKey extends keyof TResponse ? TResponse[TResponseKey] : undefined
  > {
    const response = await this.fetchResponse()

    type Response = TResponseKey extends keyof TResponse
      ? TResponse[TResponseKey]
      : undefined

    if (this.responseKey === undefined) {
      return undefined as Response
    }

    const data = readResponseData(
      response,
      this.responseKey,
      this.pathname,
    ) as Response

    if (this.responseKey === 'action_attempt') {
      const waitForActionAttempt =
        this.#config.options?.waitForActionAttempt ??
        this.#parent.defaults.waitForActionAttempt

      if (waitForActionAttempt !== false) {
        if (this.#config.actionAttempts == null) {
          throw new Error(
            'Cannot wait for an action attempt without an action attempts client',
          )
        }
        const actionAttempt = await resolveActionAttempt(
          data as unknown as ActionAttempt,
          this.#config.actionAttempts,
          typeof waitForActionAttempt === 'boolean' ? {} : waitForActionAttempt,
        )
        return actionAttempt as Response
      }
    }

    return data
  }

  /**
   * Sends the request and returns the entire response body
   * without waiting for any action attempt to resolve.
   */
  async fetchResponse(): Promise<TResponse> {
    assertValidRequestParameters(
      this.#config.parameters,
      this.pathname,
      this.#config.hasRequiredParameters ?? false,
      this.#config.requiredParameterNames ?? [],
    )

    const { client } = this.#parent
    const response = await client.request({
      url: this.pathname,
      method: this.method,
      data: this.body,
      params: this.params,
    })
    return response.data as unknown as TResponse
  }

  async then<
    TResult1 = TResponseKey extends keyof TResponse
      ? TResponse[TResponseKey]
      : undefined,
    TResult2 = never,
  >(
    onfulfilled?:
      | ((
          value: TResponseKey extends keyof TResponse
            ? TResponse[TResponseKey]
            : undefined,
        ) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): Promise<TResult1 | TResult2> {
    return await this.execute().then(onfulfilled, onrejected)
  }

  async catch<TResult = never>(
    onrejected?:
      ((reason: unknown) => TResult | PromiseLike<TResult>) | null | undefined,
  ): Promise<
    | (TResponseKey extends keyof TResponse
        ? TResponse[TResponseKey]
        : undefined)
    | TResult
  > {
    return await this.execute().catch(onrejected)
  }

  async finally(
    onfinally?: (() => void) | null | undefined,
  ): Promise<
    TResponseKey extends keyof TResponse ? TResponse[TResponseKey] : undefined
  > {
    return await this.execute().finally(onfinally)
  }
}

/**
 * Reads the response data at the response key,
 * throwing a {@link SeamHttpInvalidResponseError} for a success response
 * that is not an object or does not contain the response key.
 */
export const readResponseData = <
  TResponse,
  TResponseKey extends keyof TResponse,
>(
  response: TResponse,
  responseKey: TResponseKey,
  path: string,
): TResponse[TResponseKey] => {
  if (response == null || typeof response !== 'object') {
    throw new SeamHttpInvalidResponseError(
      path,
      String(responseKey),
      `got ${response === null ? 'null' : typeof response} instead of a response object`,
    )
  }

  if (!(responseKey in response)) {
    throw new SeamHttpInvalidResponseError(
      path,
      String(responseKey),
      'which the response does not contain',
    )
  }

  return response[responseKey]
}

const getUrlPrefix = (input: string): string => {
  if (isAbsoluteHttpUrl(input)) {
    const url = new URL(input).toString()
    if (url.endsWith('/')) return url.slice(0, -1)
    return url
  }
  if (globalThis.location != null) {
    const pathname = input.startsWith('/') ? input : `/${input}`
    return new URL(`${globalThis.location.origin}${pathname}`)
      .toString()
      .replace(/\/$/, '')
  }
  throw new Error(
    `Cannot resolve origin from ${input} in a non-browser environment`,
  )
}

// An input without an http or https scheme, e.g., localhost:3000,
// may still parse as a URL with an unintended scheme, e.g., localhost:,
// and must not be treated as an absolute URL.
const isAbsoluteHttpUrl = (input: string): boolean => {
  try {
    const { protocol } = new URL(input)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}
