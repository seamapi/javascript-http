// TODO: This file is generated from route spec
import type { Routes } from '@seamapi/types/connect'
import type { Axios } from 'axios'
import type { SetNonNullable } from 'type-fest'

export class Workspaces {
  #client: Axios

  constructor(client: Axios) {
    this.#client = client
  }

  async get(params: WorkspacesGetParams = {}): Promise<Workspace> {
    const {
      data: { workspace },
    } = await this.#client.get<WorkspacesGetResponse>('/workspaces/get', {
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
