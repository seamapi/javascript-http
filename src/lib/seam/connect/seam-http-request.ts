import type { ActionAttempt } from '@seamapi/types/connect'
import { serializeUrlSearchParams } from '@seamapi/url-search-params-serializer'
import type { Method } from 'axios'

import type { Client } from './client.js'
import type { SeamHttpRequestOptions } from './options.js'
import { resolveActionAttempt } from './resolve-action-attempt.js'
import { SeamHttpActionAttempts } from './routes/index.js'

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
  readonly options?: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'>
}

export class SeamHttpRequest<
  const TResponse,
  const TResponseKey extends keyof TResponse | undefined,
> implements
    Promise<
      TResponseKey extends keyof TResponse ? TResponse[TResponseKey] : undefined
    >
{
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

  public get responseKey(): TResponseKey {
    return this.#config.responseKey
  }

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

    const data = response[this.responseKey] as unknown as Response

    if (this.responseKey === 'action_attempt') {
      const waitForActionAttempt =
        this.#config.options?.waitForActionAttempt ??
        this.#parent.defaults.waitForActionAttempt

      if (waitForActionAttempt !== false) {
        const actionAttempt = await resolveActionAttempt(
          data as unknown as ActionAttempt,
          SeamHttpActionAttempts.fromClient(this.#parent.client, {
            ...this.#parent.defaults,
            waitForActionAttempt: false,
          }),
          typeof waitForActionAttempt === 'boolean' ? {} : waitForActionAttempt,
        )
        return actionAttempt as Response
      }
    }

    return data
  }

  async fetchResponse(): Promise<TResponse> {
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
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | null
      | undefined,
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

const getUrlPrefix = (input: string): string => {
  if (canParseUrl(input)) {
    const url = new URL(input).toString()
    if (url.endsWith('/')) return url.slice(0, -1)
    return url
  }
  if (globalThis.location != null) {
    const pathname = input.startsWith('/') ? input : `/${input}`
    return new URL(`${globalThis.location.origin}${pathname}`).toString()
  }
  throw new Error(
    `Cannot resolve origin from ${input} in a non-browser environment`,
  )
}

// UPSTREAM: Prefer URL.canParse when it has wider support.
// https://caniuse.com/mdn-api_url_canparse_static
const canParseUrl = (input: string): boolean => {
  try {
    return new URL(input) != null
  } catch {
    return false
  }
}
