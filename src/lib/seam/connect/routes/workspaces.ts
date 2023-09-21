import type { RouteRequestParams, RouteResponse } from '@seamapi/types/connect'
import type { Axios } from 'axios'
import type { SetNonNullable } from 'type-fest'

export class Workspaces {
  client: Axios

  constructor(client: Axios) {
    this.client = client
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
