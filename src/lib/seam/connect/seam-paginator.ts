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

export class SeamPaginator implements AsyncIterable<any> {
  readonly #request: SeamHttpRequest<any, any>
  readonly #parent: SeamPaginatorParent
  #page: Pagination | null
  #items: any[] | null = null

  constructor(parent: SeamPaginatorParent, request: SeamHttpRequest<any, any>) {
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

  async nextPage(): Promise<SeamHttpRequest<any, any>> {
    if (!this.hasNextPage) throw new Error('No next page')

    const request = new SeamHttpRequest(this.#parent, {
      path: this.#request.pathname,
      method: 'get',
      responseKey: this.#request.responseKey,
      params: { page_cursor: this.#page?.nextPageCursor },
    })
    await request.execute()
    this.#page = request.pagination
    await request
  }

  async toArray(): Promise<any> {
    if (this.#items != null) return this.#items

    if (this.#page != null) {
      throw new Error(
        `${SeamPaginator.constructor.name}.flatten() may not be called after using other methods of iteration`,
      )
    }

    this.#items = []
    while (this.hasNextPage) {
      for (const item of await this.nextPage()) {
        this.#items.push(item)
      }
    }
    return this.#items
  }

  async *flatten(): any {
    while (this.hasNextPage) {
      for (const item of await this.nextPage()) {
        yield item
      }
    }
  }

  async *[Symbol.asyncIterator](): any {
    while (this.hasNextPage) {
      yield this.nextPage()
    }
  }
}
