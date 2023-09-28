/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type { RouteRequestBody, RouteResponse } from '@seamapi/types/connect'
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

export class SeamHttpDevices {
  client: Axios

  constructor(apiKeyOrOptions: string | SeamHttpOptions) {
    const options = parseOptions(apiKeyOrOptions)
    this.client = createAxiosClient(options)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpDevices {
    const opts = { ...options, client }
    if (!isSeamHttpOptionsWithClient(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpDevices(opts)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpDevices {
    const opts = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpDevices(opts)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpDevices {
    const opts = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpDevices(opts)
  }

  async delete(body: DevicesDeleteBody): Promise<void> {
    await this.client.request<DevicesDeleteResponse>({
      url: '/devices/delete',
      method: 'post',
      data: body,
    })
  }

  async get(body: DevicesGetBody): Promise<DevicesGetResponse['device']> {
    const { data } = await this.client.request<DevicesGetResponse>({
      url: '/devices/get',
      method: 'post',
      data: body,
    })
    return data.device
  }

  async list(body: DevicesListBody): Promise<DevicesListResponse['devices']> {
    const { data } = await this.client.request<DevicesListResponse>({
      url: '/devices/list',
      method: 'post',
      data: body,
    })
    return data.devices
  }

  async listDeviceProviders(
    body: DevicesListDeviceProvidersBody,
  ): Promise<DevicesListDeviceProvidersResponse['device_providers']> {
    const { data } =
      await this.client.request<DevicesListDeviceProvidersResponse>({
        url: '/devices/list_device_providers',
        method: 'post',
        data: body,
      })
    return data.device_providers
  }

  async update(body: DevicesUpdateBody): Promise<void> {
    await this.client.request<DevicesUpdateResponse>({
      url: '/devices/update',
      method: 'post',
      data: body,
    })
  }
}

export type DevicesDeleteBody = SetNonNullable<
  Required<RouteRequestBody<'/devices/delete'>>
>

export type DevicesDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/devices/delete'>>
>

export type DevicesGetBody = SetNonNullable<
  Required<RouteRequestBody<'/devices/get'>>
>

export type DevicesGetResponse = SetNonNullable<
  Required<RouteResponse<'/devices/get'>>
>

export type DevicesListBody = SetNonNullable<
  Required<RouteRequestBody<'/devices/list'>>
>

export type DevicesListResponse = SetNonNullable<
  Required<RouteResponse<'/devices/list'>>
>

export type DevicesListDeviceProvidersBody = SetNonNullable<
  Required<RouteRequestBody<'/devices/list_device_providers'>>
>

export type DevicesListDeviceProvidersResponse = SetNonNullable<
  Required<RouteResponse<'/devices/list_device_providers'>>
>

export type DevicesUpdateBody = SetNonNullable<
  Required<RouteRequestBody<'/devices/update'>>
>

export type DevicesUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/devices/update'>>
>
