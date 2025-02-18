import type { Client } from './client.js'
import type { SeamHttpRequestOptions } from './options.js'
import { SeamHttpRequest } from './seam-http-request.js'

interface SeamPaginatorParent {
  readonly client: Client
  readonly defaults: Required<SeamHttpRequestOptions>
}

interface Pagination {
  readonly hasNextPage: boolean
  readonly nextPageCursor: string | null
}

export class SeamPaginator<
  const TResponse,
  const TResponseKey extends keyof TResponse,
> implements AsyncIterable<EnsureReadonlyArray<TResponse[TResponseKey]>>
{
  readonly #request: SeamHttpRequest<TResponse, TResponseKey>
  readonly #parent: SeamPaginatorParent

  constructor(
    parent: SeamPaginatorParent,
    request: SeamHttpRequest<TResponse, TResponseKey>,
  ) {
    this.#parent = parent
    this.#request = request
  }

  async first(): Promise<
    [EnsureReadonlyArray<TResponse[TResponseKey]>, Pagination]
  > {
    return await this.fetch()
  }

  async fetch(
    nextPageCursor?: Pagination['nextPageCursor'],
  ): Promise<[EnsureReadonlyArray<TResponse[TResponseKey]>, Pagination]> {
    const responseKey = this.#request.responseKey
    if (typeof responseKey !== 'string') {
      throw new Error('Cannot paginate a response without a responseKey')
    }

    const request = new SeamHttpRequest<TResponse, TResponseKey>(this.#parent, {
      path: this.#request.pathname,
      method: 'get',
      responseKey,
      params: { ...this.#request.params, next_page_cursor: nextPageCursor },
    })
    const response = await request.fetchResponseData()
    const data = response[responseKey]
    const pagination: Pagination =
      response != null &&
      typeof response === 'object' &&
      'pagination' in response
        ? (response.pagination as Pagination)
        : {
            hasNextPage: false,
            nextPageCursor: null,
          }
    if (!Array.isArray(data)) {
      throw new Error('Expected an array response')
    }
    return [
      data as EnsureReadonlyArray<TResponse[TResponseKey]>,
      pagination,
    ] as const
  }

  async toArray(): Promise<EnsureReadonlyArray<TResponse[TResponseKey]>> {
    const items = [] as EnsureMutableArray<TResponse[TResponseKey]>
    let [current, pagination] = await this.first()
    items.push(...current)
    while (pagination.hasNextPage) {
      ;[current, pagination] = await this.fetch(pagination.nextPageCursor)
      items.push(...current)
    }
    return items as EnsureReadonlyArray<TResponse[TResponseKey]>
  }

  async *flatten(): AsyncGenerator<
    EnsureReadonlyArray<TResponse[TResponseKey]>
  > {
    let [current, pagination] = await this.first()
    for (const item of current) {
      yield item
    }
    while (pagination.hasNextPage) {
      ;[current, pagination] = await this.fetch(pagination.nextPageCursor)
      for (const item of current) {
        yield item
      }
    }
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<
    EnsureReadonlyArray<TResponse[TResponseKey]>
  > {
    let [current, pagination] = await this.first()
    yield current
    while (pagination.hasNextPage) {
      ;[current, pagination] = await this.fetch(pagination.nextPageCursor)
      yield current
    }
  }
}

type EnsureReadonlyArray<T> = T extends readonly any[] ? T : never
type EnsureMutableArray<T> = T extends any[] ? T : never
