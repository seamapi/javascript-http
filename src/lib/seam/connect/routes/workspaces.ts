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

export class SeamHttpWorkspaces {
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
  ): SeamHttpWorkspaces {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpWorkspaces(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpWorkspaces {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpWorkspaces(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpWorkspaces {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpWorkspaces(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpWorkspaces> {
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
    return SeamHttpWorkspaces.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpWorkspaces {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpWorkspaces(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpWorkspaces {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpWorkspaces(constructorOptions)
  }

  createPaginator<const TResponse, const TResponseKey extends keyof TResponse>(
    request: SeamHttpRequest<TResponse, TResponseKey>,
  ): SeamPaginator<TResponse, TResponseKey> {
    return new SeamPaginator<TResponse, TResponseKey>(this, request)
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
    body?: WorkspacesCreateBody,
  ): SeamHttpRequest<WorkspacesCreateResponse, 'workspace'> {
    return new SeamHttpRequest(this, {
      pathname: '/workspaces/create',
      method: 'post',
      body,
      responseKey: 'workspace',
    })
  }

  get(
    body?: WorkspacesGetParams,
  ): SeamHttpRequest<WorkspacesGetResponse, 'workspace'> {
    return new SeamHttpRequest(this, {
      pathname: '/workspaces/get',
      method: 'post',
      body,
      responseKey: 'workspace',
    })
  }

  list(
    body?: WorkspacesListParams,
  ): SeamHttpRequest<WorkspacesListResponse, 'workspaces'> {
    return new SeamHttpRequest(this, {
      pathname: '/workspaces/list',
      method: 'post',
      body,
      responseKey: 'workspaces',
    })
  }

  resetSandbox(
    body?: WorkspacesResetSandboxBody,
    options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'> = {},
  ): SeamHttpRequest<WorkspacesResetSandboxResponse, 'action_attempt'> {
    return new SeamHttpRequest(this, {
      pathname: '/workspaces/reset_sandbox',
      method: 'post',
      body,
      responseKey: 'action_attempt',
      options,
    })
  }
}

export type WorkspacesCreateBody = RouteRequestBody<'/workspaces/create'>

export type WorkspacesCreateResponse = SetNonNullable<
  Required<RouteResponse<'/workspaces/create'>>
>

export type WorkspacesCreateOptions = never

export type WorkspacesGetParams = RouteRequestBody<'/workspaces/get'>

export type WorkspacesGetResponse = SetNonNullable<
  Required<RouteResponse<'/workspaces/get'>>
>

export type WorkspacesGetOptions = never

export type WorkspacesListParams = RouteRequestBody<'/workspaces/list'>

export type WorkspacesListResponse = SetNonNullable<
  Required<RouteResponse<'/workspaces/list'>>
>

export type WorkspacesListOptions = never

export type WorkspacesResetSandboxBody =
  RouteRequestBody<'/workspaces/reset_sandbox'>

export type WorkspacesResetSandboxResponse = SetNonNullable<
  Required<RouteResponse<'/workspaces/reset_sandbox'>>
>

export type WorkspacesResetSandboxOptions = Pick<
  SeamHttpRequestOptions,
  'waitForActionAttempt'
>
