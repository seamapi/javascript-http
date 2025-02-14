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

export class SeamHttpThermostatsSchedules {
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
  ): SeamHttpThermostatsSchedules {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpThermostatsSchedules(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpThermostatsSchedules {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpThermostatsSchedules(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpThermostatsSchedules {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpThermostatsSchedules(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpThermostatsSchedules> {
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
    return SeamHttpThermostatsSchedules.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpThermostatsSchedules {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpThermostatsSchedules(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpThermostatsSchedules {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpThermostatsSchedules(constructorOptions)
  }

  createPaginator(page: SeamHttpRequest<any, any>): SeamPaginator {
    return new SeamPaginator(this, page)
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
    body?: ThermostatsSchedulesCreateBody,
  ): SeamHttpRequest<
    ThermostatsSchedulesCreateResponse,
    'thermostat_schedule'
  > {
    return new SeamHttpRequest(this, {
      path: '/thermostats/schedules/create',
      method: 'post',
      body,
      responseKey: 'thermostat_schedule',
    })
  }

  delete(
    body?: ThermostatsSchedulesDeleteParams,
  ): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/schedules/delete',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  get(
    body?: ThermostatsSchedulesGetParams,
  ): SeamHttpRequest<ThermostatsSchedulesGetResponse, 'thermostat_schedule'> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/schedules/get',
      method: 'post',
      body,
      responseKey: 'thermostat_schedule',
    })
  }

  list(
    body?: ThermostatsSchedulesListParams,
  ): SeamHttpRequest<ThermostatsSchedulesListResponse, 'thermostat_schedules'> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/schedules/list',
      method: 'post',
      body,
      responseKey: 'thermostat_schedules',
    })
  }

  update(
    body?: ThermostatsSchedulesUpdateBody,
  ): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/schedules/update',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }
}

export type ThermostatsSchedulesCreateBody =
  RouteRequestBody<'/thermostats/schedules/create'>

export type ThermostatsSchedulesCreateResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/schedules/create'>>
>

export type ThermostatsSchedulesCreateOptions = never

export type ThermostatsSchedulesDeleteParams =
  RouteRequestBody<'/thermostats/schedules/delete'>

export type ThermostatsSchedulesDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/schedules/delete'>>
>

export type ThermostatsSchedulesDeleteOptions = never

export type ThermostatsSchedulesGetParams =
  RouteRequestBody<'/thermostats/schedules/get'>

export type ThermostatsSchedulesGetResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/schedules/get'>>
>

export type ThermostatsSchedulesGetOptions = never

export type ThermostatsSchedulesListParams =
  RouteRequestBody<'/thermostats/schedules/list'>

export type ThermostatsSchedulesListResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/schedules/list'>>
>

export type ThermostatsSchedulesListOptions = never

export type ThermostatsSchedulesUpdateBody =
  RouteRequestBody<'/thermostats/schedules/update'>

export type ThermostatsSchedulesUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/schedules/update'>>
>

export type ThermostatsSchedulesUpdateOptions = never
