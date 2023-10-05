/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type { RouteRequestBody, RouteResponse } from '@seamapi/types/connect'
import type { SetNonNullable } from 'type-fest'

import {
  type Client,
  type ClientOptions,
  createClient,
} from 'lib/seam/connect/client.js'
import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
} from 'lib/seam/connect/options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'
import { SeamHttpClientSessions } from 'lib/seam/connect/routes/client-sessions.js'

import { SeamHttpThermostatsClimateSettingSchedules } from './thermostats-climate-setting-schedules.js'

export class SeamHttpThermostats {
  client: Client

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const options = parseOptions(apiKeyOrOptions)
    this.client = createClient(options)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpThermostats {
    const opts = { ...options, client }
    if (!isSeamHttpOptionsWithClient(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpThermostats(opts)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpThermostats {
    const opts = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpThermostats(opts)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpThermostats {
    const opts = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpThermostats(opts)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: ClientOptions = {},
  ): Promise<SeamHttpThermostats> {
    const opts = parseOptions(options)
    const client = createClient({ ...opts, publishableKey })
    const clientSessions = SeamHttpClientSessions.fromClient(client)
    // TODO: clientSessions.getOrCreate({ user_identifier_key: userIdentifierKey })
    const { token } = await clientSessions.create({
      user_identifier_key: userIdentifierKey,
    })
    return SeamHttpThermostats.fromClientSessionToken(token, options)
  }

  get climateSettingSchedules(): SeamHttpThermostatsClimateSettingSchedules {
    return SeamHttpThermostatsClimateSettingSchedules.fromClient(this.client)
  }

  async cool(body: ThermostatsCoolBody): Promise<void> {
    await this.client.request<ThermostatsCoolResponse>({
      url: '/thermostats/cool',
      method: 'post',
      data: body,
    })
  }

  async get(
    body: ThermostatsGetBody,
  ): Promise<ThermostatsGetResponse['thermostat']> {
    const { data } = await this.client.request<ThermostatsGetResponse>({
      url: '/thermostats/get',
      method: 'post',
      data: body,
    })
    return data.thermostat
  }

  async heat(body: ThermostatsHeatBody): Promise<void> {
    await this.client.request<ThermostatsHeatResponse>({
      url: '/thermostats/heat',
      method: 'post',
      data: body,
    })
  }

  async heatCool(body: ThermostatsHeatCoolBody): Promise<void> {
    await this.client.request<ThermostatsHeatCoolResponse>({
      url: '/thermostats/heat_cool',
      method: 'post',
      data: body,
    })
  }

  async list(
    body: ThermostatsListBody,
  ): Promise<ThermostatsListResponse['thermostats']> {
    const { data } = await this.client.request<ThermostatsListResponse>({
      url: '/thermostats/list',
      method: 'post',
      data: body,
    })
    return data.thermostats
  }

  async off(body: ThermostatsOffBody): Promise<void> {
    await this.client.request<ThermostatsOffResponse>({
      url: '/thermostats/off',
      method: 'post',
      data: body,
    })
  }

  async setFanMode(body: ThermostatsSetFanModeBody): Promise<void> {
    await this.client.request<ThermostatsSetFanModeResponse>({
      url: '/thermostats/set_fan_mode',
      method: 'post',
      data: body,
    })
  }

  async update(body: ThermostatsUpdateBody): Promise<void> {
    await this.client.request<ThermostatsUpdateResponse>({
      url: '/thermostats/update',
      method: 'post',
      data: body,
    })
  }
}

export type ThermostatsCoolBody = RouteRequestBody<'/thermostats/cool'>

export type ThermostatsCoolResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/cool'>>
>

export type ThermostatsGetBody = RouteRequestBody<'/thermostats/get'>

export type ThermostatsGetResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/get'>>
>

export type ThermostatsHeatBody = RouteRequestBody<'/thermostats/heat'>

export type ThermostatsHeatResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/heat'>>
>

export type ThermostatsHeatCoolBody = RouteRequestBody<'/thermostats/heat_cool'>

export type ThermostatsHeatCoolResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/heat_cool'>>
>

export type ThermostatsListBody = RouteRequestBody<'/thermostats/list'>

export type ThermostatsListResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/list'>>
>

export type ThermostatsOffBody = RouteRequestBody<'/thermostats/off'>

export type ThermostatsOffResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/off'>>
>

export type ThermostatsSetFanModeBody =
  RouteRequestBody<'/thermostats/set_fan_mode'>

export type ThermostatsSetFanModeResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/set_fan_mode'>>
>

export type ThermostatsUpdateBody = RouteRequestBody<'/thermostats/update'>

export type ThermostatsUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/update'>>
>
