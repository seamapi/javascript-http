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

export class SeamHttpAccessCodesUnmanaged {
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
  ): SeamHttpAccessCodesUnmanaged {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpAccessCodesUnmanaged(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpAccessCodesUnmanaged {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpAccessCodesUnmanaged(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpAccessCodesUnmanaged {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpAccessCodesUnmanaged(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpAccessCodesUnmanaged> {
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
    return SeamHttpAccessCodesUnmanaged.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpAccessCodesUnmanaged {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpAccessCodesUnmanaged(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpAccessCodesUnmanaged {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpAccessCodesUnmanaged(constructorOptions)
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

  convertToManaged(
    body?: AccessCodesUnmanagedConvertToManagedBody,
  ): SeamHttpRequest<
    undefined | AccessCodesUnmanagedConvertToManagedBody,
    void,
    undefined
  > {
    return new SeamHttpRequest(
      this,
      {
        url: '/access_codes/unmanaged/convert_to_managed',
        method: 'post',
        data: body,
      },
      undefined,
    )
  }

  delete(
    body?: AccessCodesUnmanagedDeleteBody,
  ): SeamHttpRequest<
    undefined | AccessCodesUnmanagedDeleteBody,
    void,
    undefined
  > {
    return new SeamHttpRequest(
      this,
      {
        url: '/access_codes/unmanaged/delete',
        method: 'post',
        data: body,
      },
      undefined,
    )
  }

  get(
    body?: AccessCodesUnmanagedGetParams,
  ): SeamHttpRequest<
    undefined | AccessCodesUnmanagedGetParams,
    AccessCodesUnmanagedGetResponse,
    'access_code'
  > {
    return new SeamHttpRequest(
      this,
      {
        url: '/access_codes/unmanaged/get',
        method: 'post',
        data: body,
      },
      'access_code',
    )
  }

  list(
    body?: AccessCodesUnmanagedListParams,
  ): SeamHttpRequest<
    undefined | AccessCodesUnmanagedListParams,
    AccessCodesUnmanagedListResponse,
    'access_codes'
  > {
    return new SeamHttpRequest(
      this,
      {
        url: '/access_codes/unmanaged/list',
        method: 'post',
        data: body,
      },
      'access_codes',
    )
  }

  update(
    body?: AccessCodesUnmanagedUpdateBody,
  ): SeamHttpRequest<
    undefined | AccessCodesUnmanagedUpdateBody,
    void,
    undefined
  > {
    return new SeamHttpRequest(
      this,
      {
        url: '/access_codes/unmanaged/update',
        method: 'post',
        data: body,
      },
      undefined,
    )
  }
}

export type AccessCodesUnmanagedConvertToManagedBody =
  RouteRequestBody<'/access_codes/unmanaged/convert_to_managed'>

export type AccessCodesUnmanagedConvertToManagedResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/unmanaged/convert_to_managed'>>
>

export type AccessCodesUnmanagedConvertToManagedOptions = never

export type AccessCodesUnmanagedDeleteBody =
  RouteRequestBody<'/access_codes/unmanaged/delete'>

export type AccessCodesUnmanagedDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/unmanaged/delete'>>
>

export type AccessCodesUnmanagedDeleteOptions = never

export type AccessCodesUnmanagedGetParams =
  RouteRequestBody<'/access_codes/unmanaged/get'>

export type AccessCodesUnmanagedGetResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/unmanaged/get'>>
>

export type AccessCodesUnmanagedGetOptions = never

export type AccessCodesUnmanagedListParams =
  RouteRequestBody<'/access_codes/unmanaged/list'>

export type AccessCodesUnmanagedListResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/unmanaged/list'>>
>

export type AccessCodesUnmanagedListOptions = never

export type AccessCodesUnmanagedUpdateBody =
  RouteRequestBody<'/access_codes/unmanaged/update'>

export type AccessCodesUnmanagedUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/unmanaged/update'>>
>

export type AccessCodesUnmanagedUpdateOptions = never
