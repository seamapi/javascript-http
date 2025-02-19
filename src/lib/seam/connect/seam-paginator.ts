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
  readonly nextPageUrl: string | null
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
    if (request.responseKey == null) {
      throw new Error(
        `The ${request.pathname} endpoint does not support pagination`,
      )
    }
    this.#parent = parent
    this.#request = request
  }

  async firstPage(): Promise<
    [EnsureReadonlyArray<TResponse[TResponseKey]>, Pagination]
  > {
    return await this.#fetch()
  }

  async nextPage(
    nextPageCursor: Pagination['nextPageCursor'],
  ): Promise<[EnsureReadonlyArray<TResponse[TResponseKey]>, Pagination]> {
    if (nextPageCursor == null) {
      throw new Error('Cannot get the next page with a null nextPageCursor')
    }

    return await this.#fetch(nextPageCursor)
  }

  readonly #fetch = async (
    nextPageCursor?: Pagination['nextPageCursor'],
  ): Promise<[EnsureReadonlyArray<TResponse[TResponseKey]>, Pagination]> => {
    const responseKey = this.#request.responseKey

    if (responseKey == null) {
      throw new Error('Cannot paginate a response without a responseKey')
    }

    const request = new SeamHttpRequest<TResponse, TResponseKey>(this.#parent, {
      pathname: this.#request.pathname,
      method: 'get',
      responseKey,
      params: { ...this.#request.params, next_page_cursor: nextPageCursor },
    })
    const response = await request.fetchResponse()
    const data = response[responseKey]
    const pagination: Pagination =
      response != null &&
      typeof response === 'object' &&
      'pagination' in response
        ? (response.pagination as Pagination)
        : {
            hasNextPage: false,
            nextPageCursor: null,
            nextPageUrl: null,
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
    let [current, pagination] = await this.firstPage()
    items.push(...current)
    while (pagination.hasNextPage) {
      ;[current, pagination] = await this.nextPage(pagination.nextPageCursor)
      items.push(...current)
    }
    return items as EnsureReadonlyArray<TResponse[TResponseKey]>
  }

  async *flatten(): AsyncGenerator<
    EnsureReadonlyArray<TResponse[TResponseKey]>
  > {
    let [current, pagination] = await this.firstPage()
    for (const item of current) {
      yield item
    }
    while (pagination.hasNextPage) {
      ;[current, pagination] = await this.#fetch(pagination.nextPageCursor)
      for (const item of current) {
        yield item
      }
    }
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<
    EnsureReadonlyArray<TResponse[TResponseKey]>
  > {
    let [current, pagination] = await this.firstPage()
    yield current
    while (pagination.hasNextPage) {
      ;[current, pagination] = await this.nextPage(pagination.nextPageCursor)
      yield current
    }
  }
}

type EnsureReadonlyArray<T> = T extends readonly any[] ? T : never
type EnsureMutableArray<T> = T extends any[] ? T : never
