import type { AxiosRequestConfig } from 'axios'

import type { Client } from './client.js'
import { SeamHttpActionAttempts } from './index.js'
import type { SeamHttpRequestOptions } from './options.js'
import { resolveActionAttempt } from './resolve-action-attempt.js'

export interface SeamApiRequestParent {
  readonly client: Client
  readonly defaults: Required<SeamHttpRequestOptions>
}

export type ResponseFromSeamApiRequest<T> =
  T extends SeamApiRequest<any, infer TResponse, infer TResourceKey>
    ? TResourceKey extends keyof TResponse
      ? TResponse[TResourceKey]
      : undefined
    : never

export class SeamApiRequest<
  const TBody,
  const TResponse,
  const TResourceKey extends keyof TResponse | undefined,
> implements
    PromiseLike<
      TResourceKey extends keyof TResponse ? TResponse[TResourceKey] : undefined
    >
{
  readonly parent: SeamApiRequestParent
  readonly requestConfig: AxiosRequestConfig<TBody>
  readonly resourceKey: TResourceKey
  readonly options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'>

  constructor(
    parent: SeamApiRequestParent,
    requestConfig: AxiosRequestConfig<TBody>,
    resourceKey: TResourceKey,
    options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'> = {},
  ) {
    this.parent = parent
    this.requestConfig = requestConfig
    this.resourceKey = resourceKey
    this.options = options
  }

  async execute(): Promise<
    TResourceKey extends keyof TResponse ? TResponse[TResourceKey] : undefined
  > {
    const { client } = this.parent
    const response = await client.request(this.requestConfig)
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
