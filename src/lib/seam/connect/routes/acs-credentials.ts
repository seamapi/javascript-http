/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type { RouteRequestBody, RouteResponse } from '@seamapi/types/connect'

import {
  getAuthHeadersForClientSessionToken,
  warnOnInsecureuserIdentifierKey,
} from 'lib/seam/connect/auth.js'
import { type Client, createClient } from 'lib/seam/connect/client.js'
import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  isSeamHttpOptionsWithConsoleSessionToken,
  isSeamHttpOptionsWithPersonalAccessToken,
  type SeamHttpFromPublishableKeyOptions,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
  type SeamHttpOptionsWithConsoleSessionToken,
  type SeamHttpOptionsWithPersonalAccessToken,
  type SeamHttpRequestOptions,
} from 'lib/seam/connect/options.js'
import {
  limitToSeamHttpRequestOptions,
  parseOptions,
} from 'lib/seam/connect/parse-options.js'
import { SeamHttpRequest } from 'lib/seam/connect/seam-http-request.js'
import type { SetNonNullable } from 'lib/types.js'

import { SeamHttpAcsCredentialsUnmanaged } from './acs-credentials-unmanaged.js'
import { SeamHttpClientSessions } from './client-sessions.js'

export class SeamHttpAcsCredentials {
  client: Client
  readonly defaults: Required<SeamHttpRequestOptions>

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const options = parseOptions(apiKeyOrOptions)
    this.client = 'client' in options ? options.client : createClient(options)
    this.defaults = limitToSeamHttpRequestOptions(options)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpAcsCredentials {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpAcsCredentials(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpAcsCredentials {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpAcsCredentials(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpAcsCredentials {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpAcsCredentials(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpAcsCredentials> {
    warnOnInsecureuserIdentifierKey(userIdentifierKey)
    const clientOptions = parseOptions({ ...options, publishableKey })
    if (isSeamHttpOptionsWithClient(clientOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'The client option cannot be used with SeamHttp.fromPublishableKey',
      )
    }
    const client = createClient(clientOptions)
    const clientSessions = SeamHttpClientSessions.fromClient(client)
    const { token } = await clientSessions.getOrCreate({
      user_identifier_key: userIdentifierKey,
    })
    return SeamHttpAcsCredentials.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpAcsCredentials {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpAcsCredentials(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpAcsCredentials {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpAcsCredentials(constructorOptions)
  }

  createPaginator(page: SeamHttpRequest<any, any>): SeamPaginator {
    return new SeamPaginator(this, page)
  }

  async updateClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
  ): Promise<void> {
    const { headers } = this.client.defaults
    const authHeaders = getAuthHeadersForClientSessionToken({
      clientSessionToken,
    })
    for (const key of Object.keys(authHeaders)) {
      if (headers[key] == null) {
        throw new Error(
          'Cannot update a clientSessionToken on a client created without a clientSessionToken',
        )
      }
    }
    this.client.defaults.headers = { ...headers, ...authHeaders }
    const clientSessions = SeamHttpClientSessions.fromClient(this.client)
    await clientSessions.get()
  }

  get unmanaged(): SeamHttpAcsCredentialsUnmanaged {
    return SeamHttpAcsCredentialsUnmanaged.fromClient(
      this.client,
      this.defaults,
    )
  }

  assign(body?: AcsCredentialsAssignBody): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/acs/credentials/assign',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  create(
    body?: AcsCredentialsCreateBody,
  ): SeamHttpRequest<AcsCredentialsCreateResponse, 'acs_credential'> {
    return new SeamHttpRequest(this, {
      path: '/acs/credentials/create',
      method: 'post',
      body,
      responseKey: 'acs_credential',
    })
  }

  createOfflineCode(
    body?: AcsCredentialsCreateOfflineCodeBody,
  ): SeamHttpRequest<
    AcsCredentialsCreateOfflineCodeResponse,
    'acs_credential'
  > {
    return new SeamHttpRequest(this, {
      path: '/acs/credentials/create_offline_code',
      method: 'post',
      body,
      responseKey: 'acs_credential',
    })
  }

  delete(body?: AcsCredentialsDeleteParams): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/acs/credentials/delete',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  get(
    body?: AcsCredentialsGetParams,
  ): SeamHttpRequest<AcsCredentialsGetResponse, 'acs_credential'> {
    return new SeamHttpRequest(this, {
      path: '/acs/credentials/get',
      method: 'post',
      body,
      responseKey: 'acs_credential',
    })
  }

  list(
    body?: AcsCredentialsListParams,
  ): SeamHttpRequest<AcsCredentialsListResponse, 'acs_credentials'> {
    return new SeamHttpRequest(this, {
      path: '/acs/credentials/list',
      method: 'post',
      body,
      responseKey: 'acs_credentials',
    })
  }

  listAccessibleEntrances(
    body?: AcsCredentialsListAccessibleEntrancesParams,
  ): SeamHttpRequest<
    AcsCredentialsListAccessibleEntrancesResponse,
    'acs_entrances'
  > {
    return new SeamHttpRequest(this, {
      path: '/acs/credentials/list_accessible_entrances',
      method: 'post',
      body,
      responseKey: 'acs_entrances',
    })
  }

  unassign(
    body?: AcsCredentialsUnassignBody,
  ): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/acs/credentials/unassign',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  update(body?: AcsCredentialsUpdateBody): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/acs/credentials/update',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }
}

export type AcsCredentialsAssignBody =
  RouteRequestBody<'/acs/credentials/assign'>

export type AcsCredentialsAssignResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/assign'>>
>

export type AcsCredentialsAssignOptions = never

export type AcsCredentialsCreateBody =
  RouteRequestBody<'/acs/credentials/create'>

export type AcsCredentialsCreateResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/create'>>
>

export type AcsCredentialsCreateOptions = never

export type AcsCredentialsCreateOfflineCodeBody =
  RouteRequestBody<'/acs/credentials/create_offline_code'>

export type AcsCredentialsCreateOfflineCodeResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/create_offline_code'>>
>

export type AcsCredentialsCreateOfflineCodeOptions = never

export type AcsCredentialsDeleteParams =
  RouteRequestBody<'/acs/credentials/delete'>

export type AcsCredentialsDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/delete'>>
>

export type AcsCredentialsDeleteOptions = never

export type AcsCredentialsGetParams = RouteRequestBody<'/acs/credentials/get'>

export type AcsCredentialsGetResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/get'>>
>

export type AcsCredentialsGetOptions = never

export type AcsCredentialsListParams = RouteRequestBody<'/acs/credentials/list'>

export type AcsCredentialsListResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/list'>>
>

export type AcsCredentialsListOptions = never

export type AcsCredentialsListAccessibleEntrancesParams =
  RouteRequestBody<'/acs/credentials/list_accessible_entrances'>

export type AcsCredentialsListAccessibleEntrancesResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/list_accessible_entrances'>>
>

export type AcsCredentialsListAccessibleEntrancesOptions = never

export type AcsCredentialsUnassignBody =
  RouteRequestBody<'/acs/credentials/unassign'>

export type AcsCredentialsUnassignResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/unassign'>>
>

export type AcsCredentialsUnassignOptions = never

export type AcsCredentialsUpdateBody =
  RouteRequestBody<'/acs/credentials/update'>

export type AcsCredentialsUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/update'>>
>

export type AcsCredentialsUpdateOptions = never
