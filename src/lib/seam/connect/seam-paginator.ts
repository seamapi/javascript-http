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
  #page: Pagination | null
  #items: EnsureReadonlyArray<TResponse[TResponseKey]> | null = null

  constructor(
    parent: SeamPaginatorParent,
    request: SeamHttpRequest<TResponse, TResponseKey>,
  ) {
    this.#parent = parent
    this.#request = request
    this.#page = request.pagination
  }

  get hasNextPage(): boolean {
    if (this.#page == null) return true
    return this.#page.hasNextPage
  }

  get nextPageCursor(): string | null {
    return this.#page?.nextPageCursor ?? null
  }

  async nextPage(): Promise<EnsureReadonlyArray<TResponse[TResponseKey]>> {
    if (!this.hasNextPage) throw new Error('No next page')

    const responseKey = this.#request.responseKey
    if (typeof responseKey !== 'string') {
      throw new Error('Cannot paginate a response without a responseKey')
    }

    const request = new SeamHttpRequest<TResponse, TResponseKey>(this.#parent, {
      path: this.#request.pathname,
      method: 'get',
      responseKey,
      params: { page_cursor: this.#page?.nextPageCursor },
    })
    const result = await request.execute()
    this.#page = request.pagination ?? {
      hasNextPage: false,
      nextPageCursor: null,
    }
    if (!Array.isArray(result)) {
      throw new Error('Expected an array response')
    }
    return result as EnsureReadonlyArray<TResponse[TResponseKey]>
  }

  async toArray(): Promise<EnsureReadonlyArray<TResponse[TResponseKey]>> {
    if (this.#items != null) return this.#items

    if (this.#page != null) {
      throw new Error(
        `${SeamPaginator.constructor.name}.toArray() may not be called after using other methods of iteration`,
      )
    }

    const items = [] as EnsureMutableArray<TResponse[TResponseKey]>
    while (this.hasNextPage) {
      for (const item of await this.nextPage()) {
        items.push(item)
      }
    }
    this.#items = items as EnsureReadonlyArray<TResponse[TResponseKey]>
    return items as EnsureReadonlyArray<TResponse[TResponseKey]>
  }

  async *flatten(): AsyncGenerator<
    EnsureReadonlyArray<TResponse[TResponseKey]>
  > {
    while (this.hasNextPage) {
      for (const item of await this.nextPage()) {
        yield item
      }
    }
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<
    EnsureReadonlyArray<TResponse[TResponseKey]>
  > {
    while (this.hasNextPage) {
      yield this.nextPage()
    }
  }
}

type EnsureReadonlyArray<T> = T extends readonly any[] ? T : never
type EnsureMutableArray<T> = T extends any[] ? T : never
