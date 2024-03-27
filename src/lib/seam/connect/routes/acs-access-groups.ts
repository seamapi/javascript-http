/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type { RouteRequestBody, RouteResponse } from '@seamapi/types/connect'
import type { SetNonNullable } from 'type-fest'

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

import { SeamHttpClientSessions } from './client-sessions.js'

export class SeamHttpAcsAccessGroups {
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
  ): SeamHttpAcsAccessGroups {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpAcsAccessGroups(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpAcsAccessGroups {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpAcsAccessGroups(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpAcsAccessGroups {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpAcsAccessGroups(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpAcsAccessGroups> {
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
    return SeamHttpAcsAccessGroups.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpAcsAccessGroups {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpAcsAccessGroups(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpAcsAccessGroups {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpAcsAccessGroups(constructorOptions)
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

  addUser(body?: AcsAccessGroupsAddUserBody): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/acs/access_groups/add_user',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  get(
    body?: AcsAccessGroupsGetParams,
  ): SeamHttpRequest<AcsAccessGroupsGetResponse, 'acs_access_group'> {
    return new SeamHttpRequest(this, {
      path: '/acs/access_groups/get',
      method: 'post',
      body,
      responseKey: 'acs_access_group',
    })
  }

  list(
    body?: AcsAccessGroupsListParams,
  ): SeamHttpRequest<AcsAccessGroupsListResponse, 'acs_access_groups'> {
    return new SeamHttpRequest(this, {
      path: '/acs/access_groups/list',
      method: 'post',
      body,
      responseKey: 'acs_access_groups',
    })
  }

  listUsers(
    body?: AcsAccessGroupsListUsersParams,
  ): SeamHttpRequest<AcsAccessGroupsListUsersResponse, 'acs_users'> {
    return new SeamHttpRequest(this, {
      path: '/acs/access_groups/list_users',
      method: 'post',
      body,
      responseKey: 'acs_users',
    })
  }

  removeUser(
    body?: AcsAccessGroupsRemoveUserBody,
  ): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/acs/access_groups/remove_user',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }
}

export type AcsAccessGroupsAddUserBody =
  RouteRequestBody<'/acs/access_groups/add_user'>

export type AcsAccessGroupsAddUserResponse = SetNonNullable<
  Required<RouteResponse<'/acs/access_groups/add_user'>>
>

export type AcsAccessGroupsAddUserOptions = never

export type AcsAccessGroupsGetParams =
  RouteRequestBody<'/acs/access_groups/get'>

export type AcsAccessGroupsGetResponse = SetNonNullable<
  Required<RouteResponse<'/acs/access_groups/get'>>
>

export type AcsAccessGroupsGetOptions = never

export type AcsAccessGroupsListParams =
  RouteRequestBody<'/acs/access_groups/list'>

export type AcsAccessGroupsListResponse = SetNonNullable<
  Required<RouteResponse<'/acs/access_groups/list'>>
>

export type AcsAccessGroupsListOptions = never

export type AcsAccessGroupsListUsersParams =
  RouteRequestBody<'/acs/access_groups/list_users'>

export type AcsAccessGroupsListUsersResponse = SetNonNullable<
  Required<RouteResponse<'/acs/access_groups/list_users'>>
>

export type AcsAccessGroupsListUsersOptions = never

export type AcsAccessGroupsRemoveUserBody =
  RouteRequestBody<'/acs/access_groups/remove_user'>

export type AcsAccessGroupsRemoveUserResponse = SetNonNullable<
  Required<RouteResponse<'/acs/access_groups/remove_user'>>
>

export type AcsAccessGroupsRemoveUserOptions = never
