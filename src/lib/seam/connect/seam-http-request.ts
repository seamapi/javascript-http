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

interface SeamHttpRequestConfig<TBody, TResponseKey> {
  readonly path: string
  readonly method: Method
  readonly body?: TBody
  readonly params?: undefined | Record<string, unknown>
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
    const { params } = this.#config

    const serializer =
      typeof client.defaults.paramsSerializer === 'function'
        ? client.defaults.paramsSerializer
        : serializeUrlSearchParams

    const origin = getUrlPrefix(client.defaults.baseURL ?? '')

    const pathname = this.#config.path.startsWith('/')
      ? this.#config.path
      : `/${this.#config.path}`

    const path =
      params == null ? pathname : `${pathname}?${serializer(params)}`

    return new URL(`${origin}${path}`)
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
      params: this.#config.params,
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

const getUrlPrefix = (input: string): string => {
  try {
    const url = new URL(input).toString()
    if (url.endsWith('/')) return url.slice(0, -1)
    return url
  } catch (err: unknown) {
    if (globalThis.location != null) {
      const pathname = input.startsWith('/') ? input : `/${input}`
      return new URL(`${globalThis.location.origin}${pathname}`).toString()
    }
    throw err
  }
}
