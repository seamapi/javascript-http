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

export interface SeamHttpRequestConfig<TBody, TResponseKey> {
  readonly path: string
  readonly method: Method
  readonly body?: TBody
  readonly query?: undefined | Record<string, unknown>
  readonly responseKey: TResponseKey
  readonly options?: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'>
}

export class SeamHttpRequest<
  const TBody,
  const TResponse,
  const TResponseKey extends keyof TResponse | undefined,
> implements
    PromiseLike<
      TResponseKey extends keyof TResponse ? TResponse[TResponseKey] : undefined
    >
{
  readonly #parent: SeamHttpRequestParent
  readonly #config: SeamHttpRequestConfig<TBody, TResponseKey>

  constructor(
    parent: SeamHttpRequestParent,
    config: SeamHttpRequestConfig<TBody, TResponseKey>,
  ) {
    this.#parent = parent
    this.#config = config
  }

  public get responseKey(): TResponseKey {
    return this.#config.responseKey
  }

  public get url(): URL {
    const { client } = this.#parent
    const baseUrl = client.defaults.baseURL
    if (baseUrl === undefined) {
      throw new Error('baseUrl is required')
    }

    const query = this.#config.query
    if (query === undefined) {
      return new URL(this.#config.path, baseUrl)
    }
    return new URL(
      `${this.#config.path}?${serializeUrlSearchParams(query)}`,
      baseUrl,
    )
  }

  public get method(): Method {
    return this.#config.method
  }

  public get body(): TBody {
    return this.#config.body as TBody
  }

  async execute(): Promise<
    TResponseKey extends keyof TResponse ? TResponse[TResponseKey] : undefined
  > {
    const { client } = this.#parent
    const response = await client.request({
      url: this.#config.path,
      method: this.#config.method,
      data: this.#config.body as TBody,
      params: this.#config.query,
    })
    if (this.responseKey === undefined) {
      return undefined as TResponseKey extends keyof TResponse
        ? TResponse[TResponseKey]
        : undefined
    }
    const data = response.data[this.responseKey]
    if (this.responseKey === 'action_attempt') {
      const waitForActionAttempt =
        this.#config.options?.waitForActionAttempt ??
        this.#parent.defaults.waitForActionAttempt
      if (waitForActionAttempt !== false) {
        return await resolveActionAttempt(
          data,
          SeamHttpActionAttempts.fromClient(client, {
            ...this.#parent.defaults,
            waitForActionAttempt: false,
          }),
          typeof waitForActionAttempt === 'boolean' ? {} : waitForActionAttempt,
        )
      }
    }
    return data
  }

  then<
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
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }
}
