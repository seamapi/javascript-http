/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type {
  RouteRequestBody,
  RouteRequestParams,
  RouteResponse,
} from '@seamapi/types/connect'
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
  type SeamHttpRequestOptions,
} from 'lib/seam/connect/options.js'
import {
  limitToSeamHttpRequestOptions,
  parseOptions,
} from 'lib/seam/connect/parse-options.js'

import { SeamHttpClientSessions } from './client-sessions.js'

export class SeamHttpUserIdentities {
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
  ): SeamHttpUserIdentities {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpUserIdentities(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpUserIdentities {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpUserIdentities(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpUserIdentities {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpUserIdentities(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpUserIdentities> {
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
    return SeamHttpUserIdentities.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpUserIdentities {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpUserIdentities(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpUserIdentities {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpUserIdentities(constructorOptions)
  }

  async addAcsUser(body?: UserIdentitiesAddAcsUserBody): Promise<void> {
    await this.client.request<UserIdentitiesAddAcsUserResponse>({
      url: '/user_identities/add_acs_user',
      method: 'post',
      data: body,
    })
  }

  async create(
    body?: UserIdentitiesCreateBody,
  ): Promise<UserIdentitiesCreateResponse['user_identity']> {
    const { data } = await this.client.request<UserIdentitiesCreateResponse>({
      url: '/user_identities/create',
      method: 'post',
      data: body,
    })

    return data.user_identity
  }

  async get(
    body?: UserIdentitiesGetParams,
  ): Promise<UserIdentitiesGetResponse['user_identity']> {
    const { data } = await this.client.request<UserIdentitiesGetResponse>({
      url: '/user_identities/get',
      method: 'post',
      data: body,
    })

    return data.user_identity
  }

  async grantAccessToDevice(
    body?: UserIdentitiesGrantAccessToDeviceBody,
  ): Promise<void> {
    await this.client.request<UserIdentitiesGrantAccessToDeviceResponse>({
      url: '/user_identities/grant_access_to_device',
      method: 'post',
      data: body,
    })
  }

  async list(
    params?: UserIdentitiesListParams,
  ): Promise<UserIdentitiesListResponse['user_identities']> {
    const { data } = await this.client.request<UserIdentitiesListResponse>({
      url: '/user_identities/list',
      method: 'get',
      params,
    })

    return data.user_identities
  }

  async listAccessibleDevices(
    body?: UserIdentitiesListAccessibleDevicesParams,
  ): Promise<
    UserIdentitiesListAccessibleDevicesResponse['accessible_devices']
  > {
    const { data } =
      await this.client.request<UserIdentitiesListAccessibleDevicesResponse>({
        url: '/user_identities/list_accessible_devices',
        method: 'post',
        data: body,
      })

    return data.accessible_devices
  }

  async listAcsUsers(
    body?: UserIdentitiesListAcsUsersParams,
  ): Promise<UserIdentitiesListAcsUsersResponse['acs_users']> {
    const { data } =
      await this.client.request<UserIdentitiesListAcsUsersResponse>({
        url: '/user_identities/list_acs_users',
        method: 'post',
        data: body,
      })

    return data.acs_users
  }

  async removeAcsUser(body?: UserIdentitiesRemoveAcsUserBody): Promise<void> {
    await this.client.request<UserIdentitiesRemoveAcsUserResponse>({
      url: '/user_identities/remove_acs_user',
      method: 'post',
      data: body,
    })
  }

  async revokeAccessToDevice(
    body?: UserIdentitiesRevokeAccessToDeviceBody,
  ): Promise<void> {
    await this.client.request<UserIdentitiesRevokeAccessToDeviceResponse>({
      url: '/user_identities/revoke_access_to_device',
      method: 'post',
      data: body,
    })
  }
}

export type UserIdentitiesAddAcsUserBody =
  RouteRequestBody<'/user_identities/add_acs_user'>

export type UserIdentitiesAddAcsUserResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/add_acs_user'>>
>

export type UserIdentitiesAddAcsUserOptions = never

export type UserIdentitiesCreateBody =
  RouteRequestBody<'/user_identities/create'>

export type UserIdentitiesCreateResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/create'>>
>

export type UserIdentitiesCreateOptions = never

export type UserIdentitiesGetParams = RouteRequestBody<'/user_identities/get'>

export type UserIdentitiesGetResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/get'>>
>

export type UserIdentitiesGetOptions = never

export type UserIdentitiesGrantAccessToDeviceBody =
  RouteRequestBody<'/user_identities/grant_access_to_device'>

export type UserIdentitiesGrantAccessToDeviceResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/grant_access_to_device'>>
>

export type UserIdentitiesGrantAccessToDeviceOptions = never

export type UserIdentitiesListParams =
  RouteRequestParams<'/user_identities/list'>

export type UserIdentitiesListResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/list'>>
>

export type UserIdentitiesListOptions = never

export type UserIdentitiesListAccessibleDevicesParams =
  RouteRequestBody<'/user_identities/list_accessible_devices'>

export type UserIdentitiesListAccessibleDevicesResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/list_accessible_devices'>>
>

export type UserIdentitiesListAccessibleDevicesOptions = never

export type UserIdentitiesListAcsUsersParams =
  RouteRequestBody<'/user_identities/list_acs_users'>

export type UserIdentitiesListAcsUsersResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/list_acs_users'>>
>

export type UserIdentitiesListAcsUsersOptions = never

export type UserIdentitiesRemoveAcsUserBody =
  RouteRequestBody<'/user_identities/remove_acs_user'>

export type UserIdentitiesRemoveAcsUserResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/remove_acs_user'>>
>

export type UserIdentitiesRemoveAcsUserOptions = never

export type UserIdentitiesRevokeAccessToDeviceBody =
  RouteRequestBody<'/user_identities/revoke_access_to_device'>

export type UserIdentitiesRevokeAccessToDeviceResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/revoke_access_to_device'>>
>

export type UserIdentitiesRevokeAccessToDeviceOptions = never
