/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type {
  RouteRequestBody,
  RouteRequestParams,
  RouteResponse,
} from '@seamapi/types/connect'
import type { Axios } from 'axios'
import type { SetNonNullable } from 'type-fest'

import { createAxiosClient } from 'lib/seam/connect/axios.js'
import {
  isSeamHttpOptionsWithApiKey,
  isSeamHttpOptionsWithClient,
  isSeamHttpOptionsWithClientSessionToken,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
} from 'lib/seam/connect/client-options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'

export class SeamHttpThermostatsClimateSettingSchedules {
  client: Axios

  constructor(apiKeyOrOptions: string | SeamHttpOptions) {
    const options = parseOptions(apiKeyOrOptions)
    this.client = createAxiosClient(options)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpThermostatsClimateSettingSchedules {
    const opts = { ...options, client }
    if (!isSeamHttpOptionsWithClient(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpThermostatsClimateSettingSchedules(opts)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpThermostatsClimateSettingSchedules {
    const opts = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpThermostatsClimateSettingSchedules(opts)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpThermostatsClimateSettingSchedules {
    const opts = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpThermostatsClimateSettingSchedules(opts)
  }

  async create(
    body: ThermostatsClimateSettingSchedulesCreateBody,
  ): Promise<
    ThermostatsClimateSettingSchedulesCreateResponse['climate_setting_schedule']
  > {
    const { data } =
      await this.client.request<ThermostatsClimateSettingSchedulesCreateResponse>(
        {
          url: '/thermostats/climate_setting_schedules/create',
          method: 'post',
          data: body,
        },
      )
    return data.climate_setting_schedule
  }

  async delete(
    params?: ThermostatsClimateSettingSchedulesDeleteParams,
  ): Promise<void> {
    await this.client.request<ThermostatsClimateSettingSchedulesDeleteResponse>(
      {
        url: '/thermostats/climate_setting_schedules/delete',
        method: 'delete',
        params,
      },
    )
  }

  async get(
    body: ThermostatsClimateSettingSchedulesGetBody,
  ): Promise<
    ThermostatsClimateSettingSchedulesGetResponse['climate_setting_schedule']
  > {
    const { data } =
      await this.client.request<ThermostatsClimateSettingSchedulesGetResponse>({
        url: '/thermostats/climate_setting_schedules/get',
        method: 'post',
        data: body,
      })
    return data.climate_setting_schedule
  }

  async list(
    body: ThermostatsClimateSettingSchedulesListBody,
  ): Promise<
    ThermostatsClimateSettingSchedulesListResponse['climate_setting_schedules']
  > {
    const { data } =
      await this.client.request<ThermostatsClimateSettingSchedulesListResponse>(
        {
          url: '/thermostats/climate_setting_schedules/list',
          method: 'post',
          data: body,
        },
      )
    return data.climate_setting_schedules
  }

  async update(
    body: ThermostatsClimateSettingSchedulesUpdateBody,
  ): Promise<void> {
    await this.client.request<ThermostatsClimateSettingSchedulesUpdateResponse>(
      {
        url: '/thermostats/climate_setting_schedules/update',
        method: 'put',
        data: body,
      },
    )
  }
}

export type ThermostatsClimateSettingSchedulesCreateBody = SetNonNullable<
  Required<RouteRequestBody<'/thermostats/climate_setting_schedules/create'>>
>

export type ThermostatsClimateSettingSchedulesCreateResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/climate_setting_schedules/create'>>
>

export type ThermostatsClimateSettingSchedulesDeleteParams = SetNonNullable<
  Required<RouteRequestParams<'/thermostats/climate_setting_schedules/delete'>>
>

export type ThermostatsClimateSettingSchedulesDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/climate_setting_schedules/delete'>>
>

export type ThermostatsClimateSettingSchedulesGetBody = SetNonNullable<
  Required<RouteRequestBody<'/thermostats/climate_setting_schedules/get'>>
>

export type ThermostatsClimateSettingSchedulesGetResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/climate_setting_schedules/get'>>
>

export type ThermostatsClimateSettingSchedulesListBody = SetNonNullable<
  Required<RouteRequestBody<'/thermostats/climate_setting_schedules/list'>>
>

export type ThermostatsClimateSettingSchedulesListResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/climate_setting_schedules/list'>>
>

export type ThermostatsClimateSettingSchedulesUpdateBody = SetNonNullable<
  Required<RouteRequestBody<'/thermostats/climate_setting_schedules/update'>>
>

export type ThermostatsClimateSettingSchedulesUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/thermostats/climate_setting_schedules/update'>>
>
