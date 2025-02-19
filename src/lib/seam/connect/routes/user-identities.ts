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
import { SeamPaginator } from 'lib/seam/connect/seam-paginator.js'
import type { SetNonNullable } from 'lib/types.js'

import { SeamHttpClientSessions } from './client-sessions.js'
import { SeamHttpUserIdentitiesEnrollmentAutomations } from './user-identities-enrollment-automations.js'

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

  createPaginator<const TResponse, const TResponseKey extends keyof TResponse>(
    page: SeamHttpRequest<TResponse, TResponseKey>,
  ): SeamPaginator<TResponse, TResponseKey> {
    return new SeamPaginator<TResponse, TResponseKey>(this, page)
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

  get enrollmentAutomations(): SeamHttpUserIdentitiesEnrollmentAutomations {
    return SeamHttpUserIdentitiesEnrollmentAutomations.fromClient(
      this.client,
      this.defaults,
    )
  }

  addAcsUser(
    body?: UserIdentitiesAddAcsUserBody,
  ): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/add_acs_user',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  create(
    body?: UserIdentitiesCreateBody,
  ): SeamHttpRequest<UserIdentitiesCreateResponse, 'user_identity'> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/create',
      method: 'post',
      body,
      responseKey: 'user_identity',
    })
  }

  delete(body?: UserIdentitiesDeleteParams): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/delete',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  get(
    body?: UserIdentitiesGetParams,
  ): SeamHttpRequest<UserIdentitiesGetResponse, 'user_identity'> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/get',
      method: 'post',
      body,
      responseKey: 'user_identity',
    })
  }

  grantAccessToDevice(
    body?: UserIdentitiesGrantAccessToDeviceBody,
  ): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/grant_access_to_device',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  list(
    body?: UserIdentitiesListParams,
  ): SeamHttpRequest<UserIdentitiesListResponse, 'user_identities'> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/list',
      method: 'post',
      body,
      responseKey: 'user_identities',
    })
  }

  listAccessibleDevices(
    body?: UserIdentitiesListAccessibleDevicesParams,
  ): SeamHttpRequest<UserIdentitiesListAccessibleDevicesResponse, 'devices'> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/list_accessible_devices',
      method: 'post',
      body,
      responseKey: 'devices',
    })
  }

  listAcsSystems(
    body?: UserIdentitiesListAcsSystemsParams,
  ): SeamHttpRequest<UserIdentitiesListAcsSystemsResponse, 'acs_systems'> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/list_acs_systems',
      method: 'post',
      body,
      responseKey: 'acs_systems',
    })
  }

  listAcsUsers(
    body?: UserIdentitiesListAcsUsersParams,
  ): SeamHttpRequest<UserIdentitiesListAcsUsersResponse, 'acs_users'> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/list_acs_users',
      method: 'post',
      body,
      responseKey: 'acs_users',
    })
  }

  removeAcsUser(
    body?: UserIdentitiesRemoveAcsUserParams,
  ): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/remove_acs_user',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  revokeAccessToDevice(
    body?: UserIdentitiesRevokeAccessToDeviceParams,
  ): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/revoke_access_to_device',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  update(body?: UserIdentitiesUpdateBody): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/update',
      method: 'post',
      body,
      responseKey: undefined,
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

export type UserIdentitiesDeleteParams =
  RouteRequestBody<'/user_identities/delete'>

export type UserIdentitiesDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/delete'>>
>

export type UserIdentitiesDeleteOptions = never

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

export type UserIdentitiesListParams = RouteRequestBody<'/user_identities/list'>

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

export type UserIdentitiesListAcsSystemsParams =
  RouteRequestBody<'/user_identities/list_acs_systems'>

export type UserIdentitiesListAcsSystemsResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/list_acs_systems'>>
>

export type UserIdentitiesListAcsSystemsOptions = never

export type UserIdentitiesListAcsUsersParams =
  RouteRequestBody<'/user_identities/list_acs_users'>

export type UserIdentitiesListAcsUsersResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/list_acs_users'>>
>

export type UserIdentitiesListAcsUsersOptions = never

export type UserIdentitiesRemoveAcsUserParams =
  RouteRequestBody<'/user_identities/remove_acs_user'>

export type UserIdentitiesRemoveAcsUserResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/remove_acs_user'>>
>

export type UserIdentitiesRemoveAcsUserOptions = never

export type UserIdentitiesRevokeAccessToDeviceParams =
  RouteRequestBody<'/user_identities/revoke_access_to_device'>

export type UserIdentitiesRevokeAccessToDeviceResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/revoke_access_to_device'>>
>

export type UserIdentitiesRevokeAccessToDeviceOptions = never

export type UserIdentitiesUpdateBody =
  RouteRequestBody<'/user_identities/update'>

export type UserIdentitiesUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/update'>>
>

export type UserIdentitiesUpdateOptions = never
