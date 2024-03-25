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
import { SeamApiRequest } from 'lib/seam/connect/seam-api-request.js'

export class SeamHttpClientSessions {
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
  ): SeamHttpClientSessions {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpClientSessions(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpClientSessions {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpClientSessions(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpClientSessions {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpClientSessions(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpClientSessions> {
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
    return SeamHttpClientSessions.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpClientSessions {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpClientSessions(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpClientSessions {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpClientSessions(constructorOptions)
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

  create(
    body?: ClientSessionsCreateBody,
  ): SeamApiRequest<
    undefined | ClientSessionsCreateBody,
    ClientSessionsCreateResponse,
    'client_session'
  > {
    return new SeamApiRequest(
      this,
      {
        url: '/client_sessions/create',
        method: 'post',
        data: body,
      },
      'client_session',
    )
  }

  delete(
    body?: ClientSessionsDeleteBody,
  ): SeamApiRequest<undefined | ClientSessionsDeleteBody, void, undefined> {
    return new SeamApiRequest(
      this,
      {
        url: '/client_sessions/delete',
        method: 'post',
        data: body,
      },
      undefined,
    )
  }

  get(
    body?: ClientSessionsGetParams,
  ): SeamApiRequest<
    undefined | ClientSessionsGetParams,
    ClientSessionsGetResponse,
    'client_session'
  > {
    return new SeamApiRequest(
      this,
      {
        url: '/client_sessions/get',
        method: 'post',
        data: body,
      },
      'client_session',
    )
  }

  getOrCreate(
    body?: ClientSessionsGetOrCreateBody,
  ): SeamApiRequest<
    undefined | ClientSessionsGetOrCreateBody,
    ClientSessionsGetOrCreateResponse,
    'client_session'
  > {
    return new SeamApiRequest(
      this,
      {
        url: '/client_sessions/get_or_create',
        method: 'post',
        data: body,
      },
      'client_session',
    )
  }

  grantAccess(
    body?: ClientSessionsGrantAccessBody,
  ): SeamApiRequest<
    undefined | ClientSessionsGrantAccessBody,
    ClientSessionsGrantAccessResponse,
    'client_session'
  > {
    return new SeamApiRequest(
      this,
      {
        url: '/client_sessions/grant_access',
        method: 'post',
        data: body,
      },
      'client_session',
    )
  }

  list(
    body?: ClientSessionsListParams,
  ): SeamApiRequest<
    undefined | ClientSessionsListParams,
    ClientSessionsListResponse,
    'client_sessions'
  > {
    return new SeamApiRequest(
      this,
      {
        url: '/client_sessions/list',
        method: 'post',
        data: body,
      },
      'client_sessions',
    )
  }

  revoke(
    body?: ClientSessionsRevokeBody,
  ): SeamApiRequest<undefined | ClientSessionsRevokeBody, void, undefined> {
    return new SeamApiRequest(
      this,
      {
        url: '/client_sessions/revoke',
        method: 'post',
        data: body,
      },
      undefined,
    )
  }
}

export type ClientSessionsCreateBody =
  RouteRequestBody<'/client_sessions/create'>

export type ClientSessionsCreateResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/create'>>
>

export type ClientSessionsCreateOptions = never

export type ClientSessionsDeleteBody =
  RouteRequestBody<'/client_sessions/delete'>

export type ClientSessionsDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/delete'>>
>

export type ClientSessionsDeleteOptions = never

export type ClientSessionsGetParams = RouteRequestBody<'/client_sessions/get'>

export type ClientSessionsGetResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/get'>>
>

export type ClientSessionsGetOptions = never

export type ClientSessionsGetOrCreateBody =
  RouteRequestBody<'/client_sessions/get_or_create'>

export type ClientSessionsGetOrCreateResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/get_or_create'>>
>

export type ClientSessionsGetOrCreateOptions = never

export type ClientSessionsGrantAccessBody =
  RouteRequestBody<'/client_sessions/grant_access'>

export type ClientSessionsGrantAccessResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/grant_access'>>
>

export type ClientSessionsGrantAccessOptions = never

export type ClientSessionsListParams = RouteRequestBody<'/client_sessions/list'>

export type ClientSessionsListResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/list'>>
>

export type ClientSessionsListOptions = never

export type ClientSessionsRevokeBody =
  RouteRequestBody<'/client_sessions/revoke'>

export type ClientSessionsRevokeResponse = SetNonNullable<
  Required<RouteResponse<'/client_sessions/revoke'>>
>

export type ClientSessionsRevokeOptions = never
