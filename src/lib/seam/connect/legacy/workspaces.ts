import type { RouteRequestParams, RouteResponse } from '@seamapi/types/connect'
import type { Axios } from 'axios'
import type { SetNonNullable } from 'type-fest'

export class SeamHttpLegacyWorkspaces {
  client: Axios

  constructor(client: Axios) {
    this.client = client
  }

  async get(
    params: WorkspacesGetParams,
  ): Promise<WorkspacesGetResponse['workspace']> {
    const { data } = await this.client.request<WorkspacesGetResponse>({
      url: '/workspaces/get',
      method: 'get',
      params,
    })
    return data.workspace
  }
}

// TODO: Import from routes so no need to redefine here
type WorkspacesGetParams = SetNonNullable<
  Required<RouteRequestParams<'/workspaces/get'>>
>

type WorkspacesGetResponse = SetNonNullable<
  Required<RouteResponse<'/workspaces/get'>>
>
