import type { Method } from 'axios'

import type { Client } from './client.js'
import { SeamHttpActionAttempts } from './index.js'
import type { SeamHttpRequestOptions } from './options.js'
import { resolveActionAttempt } from './resolve-action-attempt.js'

interface SeamHttpRequestParent {
  readonly client: Client
  readonly defaults: Required<SeamHttpRequestOptions>
}

export interface SeamHttpRequestConfig<TBody, TResponseKey> {
  readonly url?: string
  readonly method?: Method
  readonly params?: any
  readonly data?: TBody
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

  public get url(): string {
    return this.#config.url ?? ''
  }

  public get method(): Method {
    return this.#config.method ?? 'get'
  }

  public get params(): any {
    return this.#config.params
  }

  public get data(): TBody {
    return this.#config.data as TBody
  }

  async execute(): Promise<
    TResponseKey extends keyof TResponse ? TResponse[TResponseKey] : undefined
  > {
    const { client } = this.#parent
    const response = await client.request({
      url: this.url,
      method: this.method,
      params: this.params,
      data: this.data,
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
