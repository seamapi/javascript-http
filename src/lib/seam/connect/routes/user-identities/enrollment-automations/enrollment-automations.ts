/*
 * Automatically generated by codegen/smith.ts.
 * Do not edit this file or add other files to this directory.
 */

import type { RouteRequestBody, RouteResponse } from '@seamapi/types/connect'

import { seamApiLtsVersion } from 'lib/lts-version.js'
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
import { SeamHttpClientSessions } from 'lib/seam/connect/routes/client-sessions/index.js'
import { SeamHttpRequest } from 'lib/seam/connect/seam-http-request.js'
import { SeamPaginator } from 'lib/seam/connect/seam-paginator.js'
import type { SetNonNullable } from 'lib/types.js'

export class SeamHttpUserIdentitiesEnrollmentAutomations {
  client: Client
  readonly defaults: Required<SeamHttpRequestOptions>
  readonly ltsVersion = seamApiLtsVersion
  static ltsVersion = seamApiLtsVersion

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const options = parseOptions(apiKeyOrOptions)
    if (!options.isUndocumentedApiEnabled) {
      throw new Error(
        'Cannot use undocumented API without isUndocumentedApiEnabled',
      )
    }
    this.client = 'client' in options ? options.client : createClient(options)
    this.defaults = limitToSeamHttpRequestOptions(options)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpUserIdentitiesEnrollmentAutomations {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpUserIdentitiesEnrollmentAutomations(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpUserIdentitiesEnrollmentAutomations {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpUserIdentitiesEnrollmentAutomations(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpUserIdentitiesEnrollmentAutomations {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpUserIdentitiesEnrollmentAutomations(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpUserIdentitiesEnrollmentAutomations> {
    warnOnInsecureuserIdentifierKey(userIdentifierKey)
    const clientOptions = parseOptions({ ...options, publishableKey })
    if (isSeamHttpOptionsWithClient(clientOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'The client option cannot be used with SeamHttpUserIdentitiesEnrollmentAutomations.fromPublishableKey',
      )
    }
    const client = createClient(clientOptions)
    const clientSessions = SeamHttpClientSessions.fromClient(client)
    const { token } = await clientSessions.getOrCreate({
      user_identifier_key: userIdentifierKey,
    })
    return SeamHttpUserIdentitiesEnrollmentAutomations.fromClientSessionToken(
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
  ): SeamHttpUserIdentitiesEnrollmentAutomations {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpUserIdentitiesEnrollmentAutomations(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpUserIdentitiesEnrollmentAutomations {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpUserIdentitiesEnrollmentAutomations(constructorOptions)
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

  delete(
    parameters?: UserIdentitiesEnrollmentAutomationsDeleteParameters,
    options: UserIdentitiesEnrollmentAutomationsDeleteOptions = {},
  ): UserIdentitiesEnrollmentAutomationsDeleteRequest {
    if (!this.defaults.isUndocumentedApiEnabled) {
      throw new Error(
        'Cannot use undocumented API without isUndocumentedApiEnabled',
      )
    }
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/enrollment_automations/delete',
      method: 'POST',
      body: parameters,
      responseKey: undefined,
      options,
    })
  }

  get(
    parameters?: UserIdentitiesEnrollmentAutomationsGetParameters,
    options: UserIdentitiesEnrollmentAutomationsGetOptions = {},
  ): UserIdentitiesEnrollmentAutomationsGetRequest {
    if (!this.defaults.isUndocumentedApiEnabled) {
      throw new Error(
        'Cannot use undocumented API without isUndocumentedApiEnabled',
      )
    }
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/enrollment_automations/get',
      method: 'POST',
      body: parameters,
      responseKey: 'enrollment_automation',
      options,
    })
  }

  launch(
    parameters?: UserIdentitiesEnrollmentAutomationsLaunchParameters,
    options: UserIdentitiesEnrollmentAutomationsLaunchOptions = {},
  ): UserIdentitiesEnrollmentAutomationsLaunchRequest {
    if (!this.defaults.isUndocumentedApiEnabled) {
      throw new Error(
        'Cannot use undocumented API without isUndocumentedApiEnabled',
      )
    }
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/enrollment_automations/launch',
      method: 'POST',
      body: parameters,
      responseKey: 'enrollment_automation',
      options,
    })
  }

  list(
    parameters?: UserIdentitiesEnrollmentAutomationsListParameters,
    options: UserIdentitiesEnrollmentAutomationsListOptions = {},
  ): UserIdentitiesEnrollmentAutomationsListRequest {
    if (!this.defaults.isUndocumentedApiEnabled) {
      throw new Error(
        'Cannot use undocumented API without isUndocumentedApiEnabled',
      )
    }
    return new SeamHttpRequest(this, {
      pathname: '/user_identities/enrollment_automations/list',
      method: 'POST',
      body: parameters,
      responseKey: 'enrollment_automations',
      options,
    })
  }
}

export type UserIdentitiesEnrollmentAutomationsDeleteParameters =
  RouteRequestBody<'/user_identities/enrollment_automations/delete'>

/**
 * @deprecated Use UserIdentitiesEnrollmentAutomationsDeleteParameters instead.
 */
export type UserIdentitiesEnrollmentAutomationsDeleteParams =
  UserIdentitiesEnrollmentAutomationsDeleteParameters

/**
 * @deprecated Use UserIdentitiesEnrollmentAutomationsDeleteRequest instead.
 */
export type UserIdentitiesEnrollmentAutomationsDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/enrollment_automations/delete'>>
>

export type UserIdentitiesEnrollmentAutomationsDeleteRequest = SeamHttpRequest<
  void,
  undefined
>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserIdentitiesEnrollmentAutomationsDeleteOptions {}

export type UserIdentitiesEnrollmentAutomationsGetParameters =
  RouteRequestBody<'/user_identities/enrollment_automations/get'>

/**
 * @deprecated Use UserIdentitiesEnrollmentAutomationsGetParameters instead.
 */
export type UserIdentitiesEnrollmentAutomationsGetParams =
  UserIdentitiesEnrollmentAutomationsGetParameters

/**
 * @deprecated Use UserIdentitiesEnrollmentAutomationsGetRequest instead.
 */
export type UserIdentitiesEnrollmentAutomationsGetResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/enrollment_automations/get'>>
>

export type UserIdentitiesEnrollmentAutomationsGetRequest = SeamHttpRequest<
  UserIdentitiesEnrollmentAutomationsGetResponse,
  'enrollment_automation'
>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserIdentitiesEnrollmentAutomationsGetOptions {}

export type UserIdentitiesEnrollmentAutomationsLaunchParameters =
  RouteRequestBody<'/user_identities/enrollment_automations/launch'>

/**
 * @deprecated Use UserIdentitiesEnrollmentAutomationsLaunchParameters instead.
 */
export type UserIdentitiesEnrollmentAutomationsLaunchBody =
  UserIdentitiesEnrollmentAutomationsLaunchParameters

/**
 * @deprecated Use UserIdentitiesEnrollmentAutomationsLaunchRequest instead.
 */
export type UserIdentitiesEnrollmentAutomationsLaunchResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/enrollment_automations/launch'>>
>

export type UserIdentitiesEnrollmentAutomationsLaunchRequest = SeamHttpRequest<
  UserIdentitiesEnrollmentAutomationsLaunchResponse,
  'enrollment_automation'
>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserIdentitiesEnrollmentAutomationsLaunchOptions {}

export type UserIdentitiesEnrollmentAutomationsListParameters =
  RouteRequestBody<'/user_identities/enrollment_automations/list'>

/**
 * @deprecated Use UserIdentitiesEnrollmentAutomationsListParameters instead.
 */
export type UserIdentitiesEnrollmentAutomationsListParams =
  UserIdentitiesEnrollmentAutomationsListParameters

/**
 * @deprecated Use UserIdentitiesEnrollmentAutomationsListRequest instead.
 */
export type UserIdentitiesEnrollmentAutomationsListResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/enrollment_automations/list'>>
>

export type UserIdentitiesEnrollmentAutomationsListRequest = SeamHttpRequest<
  UserIdentitiesEnrollmentAutomationsListResponse,
  'enrollment_automations'
>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserIdentitiesEnrollmentAutomationsListOptions {}
