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

export class SeamHttpUserIdentitiesEnrollmentAutomations {
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
        'The client option cannot be used with SeamHttp.fromPublishableKey',
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
    body?: UserIdentitiesEnrollmentAutomationsDeleteBody,
  ): SeamHttpRequest<
    undefined | UserIdentitiesEnrollmentAutomationsDeleteBody,
    void,
    undefined
  > {
    return new SeamHttpRequest(this, {
      path: '/user_identities/enrollment_automations/delete',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  get(
    body?: UserIdentitiesEnrollmentAutomationsGetParams,
  ): SeamHttpRequest<
    undefined | UserIdentitiesEnrollmentAutomationsGetParams,
    UserIdentitiesEnrollmentAutomationsGetResponse,
    'enrollment_automation'
  > {
    return new SeamHttpRequest(this, {
      path: '/user_identities/enrollment_automations/get',
      method: 'post',
      body,
      responseKey: 'enrollment_automation',
    })
  }

  launch(
    body?: UserIdentitiesEnrollmentAutomationsLaunchBody,
  ): SeamHttpRequest<
    undefined | UserIdentitiesEnrollmentAutomationsLaunchBody,
    UserIdentitiesEnrollmentAutomationsLaunchResponse,
    'enrollment_automation'
  > {
    return new SeamHttpRequest(this, {
      path: '/user_identities/enrollment_automations/launch',
      method: 'post',
      body,
      responseKey: 'enrollment_automation',
    })
  }

  list(
    body?: UserIdentitiesEnrollmentAutomationsListParams,
  ): SeamHttpRequest<
    undefined | UserIdentitiesEnrollmentAutomationsListParams,
    UserIdentitiesEnrollmentAutomationsListResponse,
    'enrollment_automations'
  > {
    return new SeamHttpRequest(this, {
      path: '/user_identities/enrollment_automations/list',
      method: 'post',
      body,
      responseKey: 'enrollment_automations',
    })
  }
}

export type UserIdentitiesEnrollmentAutomationsDeleteBody =
  RouteRequestBody<'/user_identities/enrollment_automations/delete'>

export type UserIdentitiesEnrollmentAutomationsDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/enrollment_automations/delete'>>
>

export type UserIdentitiesEnrollmentAutomationsDeleteOptions = never

export type UserIdentitiesEnrollmentAutomationsGetParams =
  RouteRequestBody<'/user_identities/enrollment_automations/get'>

export type UserIdentitiesEnrollmentAutomationsGetResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/enrollment_automations/get'>>
>

export type UserIdentitiesEnrollmentAutomationsGetOptions = never

export type UserIdentitiesEnrollmentAutomationsLaunchBody =
  RouteRequestBody<'/user_identities/enrollment_automations/launch'>

export type UserIdentitiesEnrollmentAutomationsLaunchResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/enrollment_automations/launch'>>
>

export type UserIdentitiesEnrollmentAutomationsLaunchOptions = never

export type UserIdentitiesEnrollmentAutomationsListParams =
  RouteRequestBody<'/user_identities/enrollment_automations/list'>

export type UserIdentitiesEnrollmentAutomationsListResponse = SetNonNullable<
  Required<RouteResponse<'/user_identities/enrollment_automations/list'>>
>

export type UserIdentitiesEnrollmentAutomationsListOptions = never
