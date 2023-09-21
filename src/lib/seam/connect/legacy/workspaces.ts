// TODO: Example of non-generated overrides to methods to preserve legacy behavior
import type { Routes } from '@seamapi/types/connect'
import type { SetNonNullable } from 'type-fest'

import { Workspaces } from 'lib/seam/connect/routes/workspaces.js'

export class LegacyWorkspaces extends Workspaces {
  override async get(params: WorkspacesGetParams = {}): Promise<Workspace> {
    const {
      data: { workspace },
    } = await this.client.get<WorkspacesGetResponse>('/workspaces/get', {
      params,
    })
    return workspace
  }
}

export type WorkspacesGetParams = SetNonNullable<
  Required<Routes['/workspaces/get']['commonParams']>
>

export type WorkspacesGetResponse = SetNonNullable<
  Required<Routes['/workspaces/get']['jsonResponse']>
>

// UPSTREAM: Should come from @seamapi/types/connect
// import type { Workspace } from @seamapi/types
// export type { Workspace } from '@seamapi/types/connect'
export interface Workspace {
  workspace_id: string
}
