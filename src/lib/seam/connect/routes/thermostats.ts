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
import { SeamHttpThermostatsClimateSettingSchedules } from './thermostats-climate-setting-schedules.js'

export class SeamHttpThermostats {
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
  ): SeamHttpThermostats {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpThermostats(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpThermostats {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpThermostats(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpThermostats {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpThermostats(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpThermostats> {
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
    return SeamHttpThermostats.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpThermostats {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpThermostats(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpThermostats {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpThermostats(constructorOptions)
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

  get climateSettingSchedules(): SeamHttpThermostatsClimateSettingSchedules {
    return SeamHttpThermostatsClimateSettingSchedules.fromClient(
      this.client,
      this.defaults,
    )
  }

  cool(
    body?: ThermostatsCoolBody,
    options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'> = {},
  ): SeamHttpRequest<ThermostatsCoolResponse, 'action_attempt'> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/cool',
      method: 'post',
      body,
      responseKey: 'action_attempt',
      options,
    })
  }

  get(
    body?: ThermostatsGetParams,
  ): SeamHttpRequest<ThermostatsGetResponse, 'thermostat'> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/get',
      method: 'post',
      body,
      responseKey: 'thermostat',
    })
  }

  heat(
    body?: ThermostatsHeatBody,
    options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'> = {},
  ): SeamHttpRequest<ThermostatsHeatResponse, 'action_attempt'> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/heat',
      method: 'post',
      body,
      responseKey: 'action_attempt',
      options,
    })
  }

  heatCool(
    body?: ThermostatsHeatCoolBody,
    options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'> = {},
  ): SeamHttpRequest<ThermostatsHeatCoolResponse, 'action_attempt'> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/heat_cool',
      method: 'post',
      body,
      responseKey: 'action_attempt',
      options,
    })
  }

  list(
    body?: ThermostatsListParams,
  ): SeamHttpRequest<ThermostatsListResponse, 'thermostats'> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/list',
      method: 'post',
      body,
      responseKey: 'thermostats',
    })
  }

  off(
    body?: ThermostatsOffBody,
    options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'> = {},
  ): SeamHttpRequest<ThermostatsOffResponse, 'action_attempt'> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/off',
      method: 'post',
      body,
      responseKey: 'action_attempt',
      options,
    })
  }

  setFanMode(
    body?: ThermostatsSetFanModeBody,
    options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'> = {},
  ): SeamHttpRequest<ThermostatsSetFanModeResponse, 'action_attempt'> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/set_fan_mode',
      method: 'post',
      body,
      responseKey: 'action_attempt',
      options,
    })
  }

  update(body?: ThermostatsUpdateBody): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/thermostats/update',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }
}

export type ThermostatsCoolBody = RouteRequestBody<'/thermostats/cool'>

export type ThermostatsCoolResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/cool'>>
>

export type ThermostatsCoolOptions = Pick<
  SeamHttpRequestOptions,
  'waitForActionAttempt'
>

export type ThermostatsGetParams = RouteRequestBody<'/thermostats/get'>

export type ThermostatsGetResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/get'>>
>

export type ThermostatsGetOptions = never

export type ThermostatsHeatBody = RouteRequestBody<'/thermostats/heat'>

export type ThermostatsHeatResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/heat'>>
>

export type ThermostatsHeatOptions = Pick<
  SeamHttpRequestOptions,
  'waitForActionAttempt'
>

export type ThermostatsHeatCoolBody = RouteRequestBody<'/thermostats/heat_cool'>

export type ThermostatsHeatCoolResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/heat_cool'>>
>

export type ThermostatsHeatCoolOptions = Pick<
  SeamHttpRequestOptions,
  'waitForActionAttempt'
>

export type ThermostatsListParams = RouteRequestBody<'/thermostats/list'>

export type ThermostatsListResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/list'>>
>

export type ThermostatsListOptions = never

export type ThermostatsOffBody = RouteRequestBody<'/thermostats/off'>

export type ThermostatsOffResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/off'>>
>

export type ThermostatsOffOptions = Pick<
  SeamHttpRequestOptions,
  'waitForActionAttempt'
>

export type ThermostatsSetFanModeBody =
  RouteRequestBody<'/thermostats/set_fan_mode'>

export type ThermostatsSetFanModeResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/set_fan_mode'>>
>

export type ThermostatsSetFanModeOptions = Pick<
  SeamHttpRequestOptions,
  'waitForActionAttempt'
>

export type ThermostatsUpdateBody = RouteRequestBody<'/thermostats/update'>

export type ThermostatsUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/update'>>
>

export type ThermostatsUpdateOptions = never
