import type { Method } from 'axios'

import type { Client } from './client.js'
import { SeamHttpActionAttempts } from './index.js'
import type { SeamHttpRequestOptions } from './options.js'
import { resolveActionAttempt } from './resolve-action-attempt.js'

export interface SeamHttpRequestParent {
  readonly client: Client
  readonly defaults: Required<SeamHttpRequestOptions>
}

export interface SeamHttpRequestConfig<TBody> {
  url?: string
  method?: Method
  params?: any
  data?: TBody
}

export type ResponseFromSeamHttpRequest<T> =
  T extends SeamHttpRequest<any, infer TResponse, infer TResourceKey>
    ? TResourceKey extends keyof TResponse
      ? TResponse[TResourceKey]
      : undefined
    : never

export class SeamHttpRequest<
  const TBody,
  const TResponse,
  const TResourceKey extends keyof TResponse | undefined,
> implements
    PromiseLike<
      TResourceKey extends keyof TResponse ? TResponse[TResourceKey] : undefined
    >
{
  readonly parent: SeamHttpRequestParent
  readonly config: SeamHttpRequestConfig<TBody>
  readonly resourceKey: TResourceKey
  readonly options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'>

  constructor(
    parent: SeamHttpRequestParent,
    config: SeamHttpRequestConfig<TBody>,
    resourceKey: TResourceKey,
    options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'> = {},
  ) {
    this.parent = parent
    this.config = config
    this.resourceKey = resourceKey
    this.options = options
  }

  public get url(): string {
    return this.config.url ?? ''
  }

  public get method(): Method {
    return this.config.method ?? 'get'
  }

  public get data(): TBody {
    return this.config.data as TBody
  }

  async execute(): Promise<
    TResourceKey extends keyof TResponse ? TResponse[TResourceKey] : undefined
  > {
    const { client } = this.parent
    const response = await client.request(this.config)
    if (this.resourceKey === undefined) {
      return undefined as TResourceKey extends keyof TResponse
        ? TResponse[TResourceKey]
        : undefined
    }
    const data = response.data[this.resourceKey]
    if (this.resourceKey === 'action_attempt') {
      const waitForActionAttempt =
        this.options.waitForActionAttempt ??
        this.parent.defaults.waitForActionAttempt
      if (waitForActionAttempt !== false) {
        return await resolveActionAttempt(
          data,
          SeamHttpActionAttempts.fromClient(client, {
            ...this.parent.defaults,
            waitForActionAttempt: false,
          }),
          typeof waitForActionAttempt === 'boolean' ? {} : waitForActionAttempt,
        )
      }
    }
    return data
  }

  then<
    TResult1 = TResourceKey extends keyof TResponse
      ? TResponse[TResourceKey]
      : undefined,
    TResult2 = never,
  >(
    onfulfilled?:
      | ((
          value: TResourceKey extends keyof TResponse
            ? TResponse[TResourceKey]
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
