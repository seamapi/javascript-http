import type { RouteRequestParams, RouteResponse } from '@seamapi/types/connect'
import { Axios } from 'axios'
import type { SetNonNullable } from 'type-fest'

import { createAxiosClient } from 'lib/seam/connect/axios.js'
import type { SeamHttpOptions } from 'lib/seam/connect/client-options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'

export class SeamHttpWorkspaces {
  client: Axios

  constructor(apiKeyOrOptionsOrClient: Axios | string | SeamHttpOptions) {
    if (apiKeyOrOptionsOrClient instanceof Axios) {
      this.client = apiKeyOrOptionsOrClient
      return
    }

    const options = parseOptions(apiKeyOrOptionsOrClient)
    this.client = createAxiosClient(options)
  }

  async get(
    params: WorkspacesGetParams = {},
  ): Promise<WorkspacesGetResponse['workspace']> {
    const { data } = await this.client.get<WorkspacesGetResponse>(
      '/workspaces/get',
      {
        params,
      },
    )
    return data.workspace
  }
}

export type WorkspacesGetParams = SetNonNullable<
  Required<RouteRequestParams<'/workspaces/get'>>
>

export type WorkspacesGetResponse = SetNonNullable<
  Required<RouteResponse<'/workspaces/get'>>
>
