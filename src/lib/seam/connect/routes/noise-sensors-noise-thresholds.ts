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

export class SeamHttpNoiseSensorsNoiseThresholds {
  client: Client

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const options = parseOptions(apiKeyOrOptions)
    this.client = createClient(options)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpNoiseSensorsNoiseThresholds {
    const opts = { ...options, client }
    if (!isSeamHttpOptionsWithClient(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpNoiseSensorsNoiseThresholds(opts)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpNoiseSensorsNoiseThresholds {
    const opts = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpNoiseSensorsNoiseThresholds(opts)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpNoiseSensorsNoiseThresholds {
    const opts = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpNoiseSensorsNoiseThresholds(opts)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: ClientOptions = {},
  ): Promise<SeamHttpNoiseSensorsNoiseThresholds> {
    const opts = parseOptions(options)
    const client = createClient({ ...opts, publishableKey })
    const clientSessions = SeamHttpClientSessions.fromClient(client)
    // TODO: clientSessions.getOrCreate({ user_identifier_key: userIdentifierKey })
    const { token } = await clientSessions.create({
      user_identifier_key: userIdentifierKey,
    })
    return SeamHttpNoiseSensorsNoiseThresholds.fromClientSessionToken(
      token,
      options,
    )
  }

  async create(body: NoiseSensorsNoiseThresholdsCreateBody): Promise<void> {
    await this.client.request<NoiseSensorsNoiseThresholdsCreateResponse>({
      url: '/noise_sensors/noise_thresholds/create',
      method: 'post',
      data: body,
    })
  }

  async delete(body: NoiseSensorsNoiseThresholdsDeleteBody): Promise<void> {
    await this.client.request<NoiseSensorsNoiseThresholdsDeleteResponse>({
      url: '/noise_sensors/noise_thresholds/delete',
      method: 'post',
      data: body,
    })
  }

  async get(
    body: NoiseSensorsNoiseThresholdsGetBody,
  ): Promise<NoiseSensorsNoiseThresholdsGetResponse['noise_threshold']> {
    const { data } =
      await this.client.request<NoiseSensorsNoiseThresholdsGetResponse>({
        url: '/noise_sensors/noise_thresholds/get',
        method: 'post',
        data: body,
      })
    return data.noise_threshold
  }

  async list(
    body: NoiseSensorsNoiseThresholdsListBody,
  ): Promise<NoiseSensorsNoiseThresholdsListResponse['noise_thresholds']> {
    const { data } =
      await this.client.request<NoiseSensorsNoiseThresholdsListResponse>({
        url: '/noise_sensors/noise_thresholds/list',
        method: 'post',
        data: body,
      })
    return data.noise_thresholds
  }

  async update(body: NoiseSensorsNoiseThresholdsUpdateBody): Promise<void> {
    await this.client.request<NoiseSensorsNoiseThresholdsUpdateResponse>({
      url: '/noise_sensors/noise_thresholds/update',
      method: 'post',
      data: body,
    })
  }
}

export type NoiseSensorsNoiseThresholdsCreateBody =
  RouteRequestBody<'/noise_sensors/noise_thresholds/create'>

export type NoiseSensorsNoiseThresholdsCreateResponse = SetNonNullable<
  Required<RouteResponse<'/noise_sensors/noise_thresholds/create'>>
>

export type NoiseSensorsNoiseThresholdsDeleteBody =
  RouteRequestBody<'/noise_sensors/noise_thresholds/delete'>

export type NoiseSensorsNoiseThresholdsDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/noise_sensors/noise_thresholds/delete'>>
>

export type NoiseSensorsNoiseThresholdsGetBody =
  RouteRequestBody<'/noise_sensors/noise_thresholds/get'>

export type NoiseSensorsNoiseThresholdsGetResponse = SetNonNullable<
  Required<RouteResponse<'/noise_sensors/noise_thresholds/get'>>
>

export type NoiseSensorsNoiseThresholdsListBody =
  RouteRequestBody<'/noise_sensors/noise_thresholds/list'>

export type NoiseSensorsNoiseThresholdsListResponse = SetNonNullable<
  Required<RouteResponse<'/noise_sensors/noise_thresholds/list'>>
>

export type NoiseSensorsNoiseThresholdsUpdateBody =
  RouteRequestBody<'/noise_sensors/noise_thresholds/update'>

export type NoiseSensorsNoiseThresholdsUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/noise_sensors/noise_thresholds/update'>>
>
