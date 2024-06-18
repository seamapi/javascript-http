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
import { SeamHttpDevicesSimulate } from './devices-simulate.js'
import { SeamHttpDevicesUnmanaged } from './devices-unmanaged.js'

/**
 * Handles post requests to /devices/delete.
 *
 * @param {BodyType} request - The request body.
 * @returns {Promise<DevicesDeleteResponse>}
 */

/**
 * Handles post requests to /devices/get.
 *
 * @param {BodyType} request - The request body.
 * @returns {Promise<DevicesGetResponse>}
 */

/**
 * Handles post requests to /devices/list.
 *
 * @param {BodyType} request - The request body.
 * @returns {Promise<DevicesListResponse>}
 */

/**
 * Handles post requests to /devices/list_device_providers.
 *
 * @param {BodyType} request - The request body.
 * @returns {Promise<DevicesListDeviceProvidersResponse>}
 */

/**
 * Handles post requests to /devices/update.
 *
 * @param {BodyType} request - The request body.
 * @returns {Promise<void>}
 */

export class SeamHttpDevices {
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

  get unmanaged(): SeamHttpDevicesUnmanaged {
    return SeamHttpDevicesUnmanaged.fromClient(this.client, this.defaults)
  }

  get simulate(): SeamHttpDevicesSimulate {
    return SeamHttpDevicesSimulate.fromClient(this.client, this.defaults)
  }

  delete(body?: DevicesDeleteBody): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/devices/delete',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }

  get(body?: DevicesGetParams): SeamHttpRequest<DevicesGetResponse, 'device'> {
    return new SeamHttpRequest(this, {
      path: '/devices/get',
      method: 'post',
      body,
      responseKey: 'device',
    })
  }

  list(
    body?: DevicesListParams,
  ): SeamHttpRequest<DevicesListResponse, 'devices'> {
    return new SeamHttpRequest(this, {
      path: '/devices/list',
      method: 'post',
      body,
      responseKey: 'devices',
    })
  }

  listDeviceProviders(
    body?: DevicesListDeviceProvidersParams,
  ): SeamHttpRequest<DevicesListDeviceProvidersResponse, 'device_providers'> {
    return new SeamHttpRequest(this, {
      path: '/devices/list_device_providers',
      method: 'post',
      body,
      responseKey: 'device_providers',
    })
  }

  update(body?: DevicesUpdateBody): SeamHttpRequest<void, undefined> {
    return new SeamHttpRequest(this, {
      path: '/devices/update',
      method: 'post',
      body,
      responseKey: undefined,
    })
  }
}

export type DevicesDeleteBody = RouteRequestBody<'/devices/delete'>

export type DevicesDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/devices/delete'>>
>

export type DevicesDeleteOptions = never

export type DevicesGetParams = RouteRequestBody<'/devices/get'>

export type DevicesGetResponse = SetNonNullable<
  Required<RouteResponse<'/devices/get'>>
>

export type DevicesGetOptions = never

export type DevicesListParams = RouteRequestBody<'/devices/list'>

export type DevicesListResponse = SetNonNullable<
  Required<RouteResponse<'/devices/list'>>
>

export type DevicesListOptions = never

export type DevicesListDeviceProvidersParams =
  RouteRequestBody<'/devices/list_device_providers'>

export type DevicesListDeviceProvidersResponse = SetNonNullable<
  Required<RouteResponse<'/devices/list_device_providers'>>
>

export type DevicesListDeviceProvidersOptions = never

export type DevicesUpdateBody = RouteRequestBody<'/devices/update'>

export type DevicesUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/devices/update'>>
>

export type DevicesUpdateOptions = never
