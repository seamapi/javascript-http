/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type { RouteRequestBody, RouteResponse } from '@seamapi/types/connect'
import type { SetNonNullable } from 'type-fest'

import { warnOnInsecureuserIdentifierKey } from 'lib/seam/connect/auth.js'
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
} from 'lib/seam/connect/options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'

import { SeamHttpClientSessions } from './client-sessions.js'

export class SeamHttpAcsAccessGroups {
  client: Client

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const clientOptions = parseOptions(apiKeyOrOptions)
    this.client = createClient(clientOptions)
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

  async addUser(body?: AcsAccessGroupsAddUserBody): Promise<void> {
    await this.client.request<AcsAccessGroupsAddUserResponse>({
      url: '/acs/access_groups/add_user',
      method: 'post',
      data: body,
    })
  }

  async get(
    body?: AcsAccessGroupsGetParams,
  ): Promise<AcsAccessGroupsGetResponse['acs_access_group']> {
    const { data } = await this.client.request<AcsAccessGroupsGetResponse>({
      url: '/acs/access_groups/get',
      method: 'post',
      data: body,
    })

    return data.acs_access_group
  }

  async list(
    body?: AcsAccessGroupsListParams,
  ): Promise<AcsAccessGroupsListResponse['acs_access_groups']> {
    const { data } = await this.client.request<AcsAccessGroupsListResponse>({
      url: '/acs/access_groups/list',
      method: 'post',
      data: body,
    })

    return data.acs_access_groups
  }

  async listUsers(
    body?: AcsAccessGroupsListUsersParams,
  ): Promise<AcsAccessGroupsListUsersResponse['acs_users']> {
    const { data } =
      await this.client.request<AcsAccessGroupsListUsersResponse>({
        url: '/acs/access_groups/list_users',
        method: 'post',
        data: body,
      })

    return data.acs_users
  }

  async removeUser(body?: AcsAccessGroupsRemoveUserBody): Promise<void> {
    await this.client.request<AcsAccessGroupsRemoveUserResponse>({
      url: '/acs/access_groups/remove_user',
      method: 'post',
      data: body,
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
