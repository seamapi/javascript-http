import type { RouteRequestParams, RouteResponse } from '@seamapi/types/connect'
import type { SetNonNullable } from 'type-fest'

import { Workspaces } from 'lib/seam/connect/routes/workspaces.js'

export class LegacyWorkspaces extends Workspaces {
  override async get(
    params: WorkspacesGetParams = {},
  ): Promise<WorkspacesGetResponse['workspace']> {
    const {
      data: { workspace },
    } = await this.client.get<WorkspacesGetResponse>('/workspaces/get', {
      params,
    })
    return workspace
  }
}

export type WorkspacesGetParams = SetNonNullable<
  Required<RouteRequestParams<'/workspaces/get'>>
>

export type WorkspacesGetResponse = SetNonNullable<
  Required<RouteResponse<'/workspaces/get'>>
>
