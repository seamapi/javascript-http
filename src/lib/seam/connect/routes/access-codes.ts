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

import { SeamHttpAccessCodesSimulate } from './access-codes-simulate.js'
import { SeamHttpAccessCodesUnmanaged } from './access-codes-unmanaged.js'
import { SeamHttpClientSessions } from './client-sessions.js'

export class SeamHttpAccessCodes {
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
  ): SeamHttpAccessCodes {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpAccessCodes(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpAccessCodes {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpAccessCodes(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpAccessCodes {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpAccessCodes(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpAccessCodes> {
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
    return SeamHttpAccessCodes.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpAccessCodes {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpAccessCodes(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpAccessCodes {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpAccessCodes(constructorOptions)
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

  get unmanaged(): SeamHttpAccessCodesUnmanaged {
    return SeamHttpAccessCodesUnmanaged.fromClient(this.client, this.defaults)
  }

  get simulate(): SeamHttpAccessCodesSimulate {
    return SeamHttpAccessCodesSimulate.fromClient(this.client, this.defaults)
  }

  create(
    body?: AccessCodesCreateBody,
  ): SeamHttpRequest<AccessCodesCreateResponse, 'access_code'> {
    return new SeamHttpRequest(this, {
      path: '/access_codes/create',
      method: 'post',
      body,
      responseKey: 'access_code',
    })
  }

  createMultiple(
    body?: AccessCodesCreateMultipleBody,
  ): SeamHttpRequest<AccessCodesCreateMultipleResponse, 'access_codes'> {
    return new SeamHttpRequest(this, {
      path: '/access_codes/create_multiple',
      method: 'post',
      body,
      responseKey: 'access_codes',
    })
  }

  delete(body?: AccessCodesDeleteBody): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/access_codes/delete',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  generateCode(
    body?: AccessCodesGenerateCodeBody,
  ): SeamHttpRequest<AccessCodesGenerateCodeResponse, 'generated_code'> {
    return new SeamHttpRequest(this, {
      path: '/access_codes/generate_code',
      method: 'post',
      body,
      responseKey: 'generated_code',
    })
  }

  get(
    body?: AccessCodesGetParams,
  ): SeamHttpRequest<AccessCodesGetResponse, 'access_code'> {
    return new SeamHttpRequest(this, {
      path: '/access_codes/get',
      method: 'post',
      body,
      responseKey: 'access_code',
    })
  }

  list(
    body?: AccessCodesListParams,
  ): SeamHttpRequest<AccessCodesListResponse, 'access_codes'> {
    return new SeamHttpRequest(this, {
      path: '/access_codes/list',
      method: 'post',
      body,
      responseKey: 'access_codes',
    })
  }

  pullBackupAccessCode(
    body?: AccessCodesPullBackupAccessCodeBody,
  ): SeamHttpRequest<
    AccessCodesPullBackupAccessCodeResponse,
    'backup_access_code'
  > {
    return new SeamHttpRequest(this, {
      path: '/access_codes/pull_backup_access_code',
      method: 'post',
      body,
      responseKey: 'backup_access_code',
    })
  }

  update(body?: AccessCodesUpdateBody): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/access_codes/update',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }
}

export type AccessCodesCreateBody = RouteRequestBody<'/access_codes/create'>

export type AccessCodesCreateResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/create'>>
>

export type AccessCodesCreateOptions = never

export type AccessCodesCreateMultipleBody =
  RouteRequestBody<'/access_codes/create_multiple'>

export type AccessCodesCreateMultipleResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/create_multiple'>>
>

export type AccessCodesCreateMultipleOptions = never

export type AccessCodesDeleteBody = RouteRequestBody<'/access_codes/delete'>

export type AccessCodesDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/delete'>>
>

export type AccessCodesDeleteOptions = never

export type AccessCodesGenerateCodeBody =
  RouteRequestBody<'/access_codes/generate_code'>

export type AccessCodesGenerateCodeResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/generate_code'>>
>

export type AccessCodesGenerateCodeOptions = never

export type AccessCodesGetParams = RouteRequestBody<'/access_codes/get'>

export type AccessCodesGetResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/get'>>
>

export type AccessCodesGetOptions = never

export type AccessCodesListParams = RouteRequestBody<'/access_codes/list'>

export type AccessCodesListResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/list'>>
>

export type AccessCodesListOptions = never

export type AccessCodesPullBackupAccessCodeBody =
  RouteRequestBody<'/access_codes/pull_backup_access_code'>

export type AccessCodesPullBackupAccessCodeResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/pull_backup_access_code'>>
>

export type AccessCodesPullBackupAccessCodeOptions = never

export type AccessCodesUpdateBody = RouteRequestBody<'/access_codes/update'>

export type AccessCodesUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/update'>>
>

export type AccessCodesUpdateOptions = never
