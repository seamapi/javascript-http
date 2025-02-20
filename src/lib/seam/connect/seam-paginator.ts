import type { Client } from './client.js'
import type { SeamHttpRequestOptions } from './options.js'
import { SeamHttpRequest } from './seam-http-request.js'

interface SeamPaginatorParent {
  readonly client: Client
  readonly defaults: Required<SeamHttpRequestOptions>
}

declare const $brand: unique symbol

type PageCursor = string & { [$brand]: 'SeamPageCursor' }

interface Pagination {
  readonly hasNextPage: boolean
  readonly nextPageCursor: PageCursor | null
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

  async #fetch (
    nextPageCursor?: Pagination['nextPageCursor'],
  ): Promise<[EnsureReadonlyArray<TResponse[TResponseKey]>, Pagination]> {
    const responseKey = this.#request.responseKey

    if (responseKey == null) {
      throw new Error('Cannot paginate a response without a responseKey')
    }

    const request = new SeamHttpRequest<TResponse, TResponseKey>(this.#parent, {
      pathname: this.#request.pathname,
      method: this.#request.method,
      responseKey,
      params:
        this.#request.params != null
          ? { ...this.#request.params, page_cursor: nextPageCursor }
          : undefined,
      body:
        this.#request.body != null
          ? { ...this.#request.body, page_cursor: nextPageCursor }
          : undefined,
    })

    const response = await request.fetchResponse()
    const data = response[responseKey]

    const paginationData =
      response != null &&
      typeof response === 'object' &&
      'pagination' in response
        ? (response.pagination as PaginationData)
        : null

    const pagination: Pagination = {
      hasNextPage: paginationData?.has_next_page ?? false,
      nextPageCursor: paginationData?.next_page_cursor ?? null,
      nextPageUrl: paginationData?.next_page_url ?? null,
    }

    if (!Array.isArray(data)) {
      throw new Error(
        `Expected an array response for ${String(responseKey)} but got ${String(typeof data)}`,
      )
    }

    return [
      data as EnsureReadonlyArray<TResponse[TResponseKey]>,
      pagination,
    ] as const
  }

  async flattenToArray(): Promise<
    EnsureReadonlyArray<TResponse[TResponseKey]>
  > {
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
      ;[current, pagination] = await this.nextPage(pagination.nextPageCursor)
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

interface PaginationData {
  has_next_page: boolean
  next_page_cursor: PageCursor | null
  next_page_url: string | null
}
