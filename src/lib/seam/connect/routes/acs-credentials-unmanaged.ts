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

import { SeamHttpClientSessions } from './client-sessions.js'

export class SeamHttpAcsCredentialsUnmanaged {
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
  ): SeamHttpAcsCredentialsUnmanaged {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpAcsCredentialsUnmanaged(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpAcsCredentialsUnmanaged {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpAcsCredentialsUnmanaged(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpAcsCredentialsUnmanaged {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpAcsCredentialsUnmanaged(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpAcsCredentialsUnmanaged> {
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
    return SeamHttpAcsCredentialsUnmanaged.fromClientSessionToken(
      token,
      options,
    )
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpAcsCredentialsUnmanaged {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpAcsCredentialsUnmanaged(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpAcsCredentialsUnmanaged {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpAcsCredentialsUnmanaged(constructorOptions)
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

  get(
    body?: AcsCredentialsUnmanagedGetParams,
  ): SeamHttpRequest<AcsCredentialsUnmanagedGetResponse, 'acs_credential'> {
    return new SeamHttpRequest(this, {
      pathname: '/acs/credentials/unmanaged/get',
      method: 'post',
      body,
      responseKey: 'acs_credential',
    })
  }

  list(
    body?: AcsCredentialsUnmanagedListParams,
  ): SeamHttpRequest<AcsCredentialsUnmanagedListResponse, 'acs_credentials'> {
    return new SeamHttpRequest(this, {
      pathname: '/acs/credentials/unmanaged/list',
      method: 'post',
      body,
      responseKey: 'acs_credentials',
    })
  }
}

export type AcsCredentialsUnmanagedGetParams =
  RouteRequestBody<'/acs/credentials/unmanaged/get'>

export type AcsCredentialsUnmanagedGetResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/unmanaged/get'>>
>

export type AcsCredentialsUnmanagedGetOptions = never

export type AcsCredentialsUnmanagedListParams =
  RouteRequestBody<'/acs/credentials/unmanaged/list'>

export type AcsCredentialsUnmanagedListResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/unmanaged/list'>>
>

export type AcsCredentialsUnmanagedListOptions = never
