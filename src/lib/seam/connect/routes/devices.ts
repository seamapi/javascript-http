/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type { RouteRequestBody, RouteResponse } from '@seamapi/types/connect'
import type { SetNonNullable } from 'type-fest'

import { warnOnInsecureuserIdentifierKey } from 'lib/seam/connect/auth.js'
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
} from 'lib/seam/connect/options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'

import { SeamHttpClientSessions } from './client-sessions.js'
import { SeamHttpDevicesUnmanaged } from './devices-unmanaged.js'

export class SeamHttpDevices {
  client: Client

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const clientOptions = parseOptions(apiKeyOrOptions)
    this.client = createClient(clientOptions)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpDevices {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpDevices(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpDevices {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpDevices(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpDevices {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpDevices(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpDevices> {
    warnOnInsecureuserIdentifierKey(userIdentifierKey)
    const clientOptions = parseOptions({ ...options, publishableKey })
    const client = createClient(clientOptions)
    const clientSessions = SeamHttpClientSessions.fromClient(client)
    const { token } = await clientSessions.getOrCreate({
      user_identifier_key: userIdentifierKey,
    })
    return SeamHttpDevices.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpDevices {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpDevices(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpDevices {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpDevices(constructorOptions)
  }

  get unmanaged(): SeamHttpDevicesUnmanaged {
    return SeamHttpDevicesUnmanaged.fromClient(this.client)
  }

  async delete(body?: DevicesDeleteBody): Promise<void> {
    await this.client.request<DevicesDeleteResponse>({
      url: '/devices/delete',
      method: 'post',
      data: body,
    })
  }

  async get(body?: DevicesGetParams): Promise<DevicesGetResponse['device']> {
    const { data } = await this.client.request<DevicesGetResponse>({
      url: '/devices/get',
      method: 'post',
      data: body,
    })
    return data.device
  }

  async list(
    body?: DevicesListParams,
  ): Promise<DevicesListResponse['devices']> {
    const { data } = await this.client.request<DevicesListResponse>({
      url: '/devices/list',
      method: 'post',
      data: body,
    })
    return data.devices
  }

  async listDeviceProviders(
    body?: DevicesListDeviceProvidersParams,
  ): Promise<DevicesListDeviceProvidersResponse['device_providers']> {
    const { data } =
      await this.client.request<DevicesListDeviceProvidersResponse>({
        url: '/devices/list_device_providers',
        method: 'post',
        data: body,
      })
    return data.device_providers
  }

  async update(body?: DevicesUpdateBody): Promise<void> {
    await this.client.request<DevicesUpdateResponse>({
      url: '/devices/update',
      method: 'post',
      data: body,
    })
  }
}

export type DevicesDeleteBody = RouteRequestBody<'/devices/delete'>

export type DevicesDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/devices/delete'>>
>

export type DevicesGetParams = RouteRequestBody<'/devices/get'>

export type DevicesGetResponse = SetNonNullable<
  Required<RouteResponse<'/devices/get'>>
>

export type DevicesListParams = RouteRequestBody<'/devices/list'>

export type DevicesListResponse = SetNonNullable<
  Required<RouteResponse<'/devices/list'>>
>

export type DevicesListDeviceProvidersParams =
  RouteRequestBody<'/devices/list_device_providers'>

export type DevicesListDeviceProvidersResponse = SetNonNullable<
  Required<RouteResponse<'/devices/list_device_providers'>>
>

export type DevicesUpdateBody = RouteRequestBody<'/devices/update'>

export type DevicesUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/devices/update'>>
>
