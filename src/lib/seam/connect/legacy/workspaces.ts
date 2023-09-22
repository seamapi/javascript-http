import type { RouteRequestParams, RouteResponse } from '@seamapi/types/connect'
import type { SetNonNullable } from 'type-fest'

import { SeamHttpWorkspaces } from 'lib/seam/connect/routes/workspaces.js'

export class SeamHttpLegacyWorkspaces extends SeamHttpWorkspaces {
  override async get(
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
