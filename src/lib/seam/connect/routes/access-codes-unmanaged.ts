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
  type SeamHttpFromPublishableKeyOptions,
  SeamHttpInvalidOptionsError,
  type SeamHttpOptions,
  type SeamHttpOptionsWithApiKey,
  type SeamHttpOptionsWithClient,
  type SeamHttpOptionsWithClientSessionToken,
} from 'lib/seam/connect/options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'

import { SeamHttpClientSessions } from './client-sessions.js'

export class SeamHttpAccessCodesUnmanaged {
  client: Client

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const clientOptions = parseOptions(apiKeyOrOptions)
    this.client = createClient(clientOptions)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpAccessCodesUnmanaged {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpAccessCodesUnmanaged(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpAccessCodesUnmanaged {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpAccessCodesUnmanaged(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpAccessCodesUnmanaged {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpAccessCodesUnmanaged(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpAccessCodesUnmanaged> {
    warnOnInsecureuserIdentifierKey(userIdentifierKey)
    const clientOptions = parseOptions({ ...options, publishableKey })
    const client = createClient(clientOptions)
    const clientSessions = SeamHttpClientSessions.fromClient(client)
    // TODO: clientSessions.getOrCreate({ user_identifier_key: userIdentifierKey })
    const { token } = await clientSessions.create({
      user_identifier_key: userIdentifierKey,
    })
    return SeamHttpAccessCodesUnmanaged.fromClientSessionToken(token, options)
  }

  async convertToManaged(
    body: AccessCodesUnmanagedConvertToManagedBody,
  ): Promise<void> {
    await this.client.request<AccessCodesUnmanagedConvertToManagedResponse>({
      url: '/access_codes/unmanaged/convert_to_managed',
      method: 'post',
      data: body,
    })
  }

  async delete(body: AccessCodesUnmanagedDeleteBody): Promise<void> {
    await this.client.request<AccessCodesUnmanagedDeleteResponse>({
      url: '/access_codes/unmanaged/delete',
      method: 'post',
      data: body,
    })
  }

  async get(
    body: AccessCodesUnmanagedGetBody,
  ): Promise<AccessCodesUnmanagedGetResponse['access_code']> {
    const { data } = await this.client.request<AccessCodesUnmanagedGetResponse>(
      {
        url: '/access_codes/unmanaged/get',
        method: 'post',
        data: body,
      },
    )
    return data.access_code
  }

  async list(
    body: AccessCodesUnmanagedListBody,
  ): Promise<AccessCodesUnmanagedListResponse['access_codes']> {
    const { data } =
      await this.client.request<AccessCodesUnmanagedListResponse>({
        url: '/access_codes/unmanaged/list',
        method: 'post',
        data: body,
      })
    return data.access_codes
  }

  async update(body: AccessCodesUnmanagedUpdateBody): Promise<void> {
    await this.client.request<AccessCodesUnmanagedUpdateResponse>({
      url: '/access_codes/unmanaged/update',
      method: 'post',
      data: body,
    })
  }
}

export type AccessCodesUnmanagedConvertToManagedBody =
  RouteRequestBody<'/access_codes/unmanaged/convert_to_managed'>

export type AccessCodesUnmanagedConvertToManagedResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/unmanaged/convert_to_managed'>>
>

export type AccessCodesUnmanagedDeleteBody =
  RouteRequestBody<'/access_codes/unmanaged/delete'>

export type AccessCodesUnmanagedDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/unmanaged/delete'>>
>

export type AccessCodesUnmanagedGetBody =
  RouteRequestBody<'/access_codes/unmanaged/get'>

export type AccessCodesUnmanagedGetResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/unmanaged/get'>>
>

export type AccessCodesUnmanagedListBody =
  RouteRequestBody<'/access_codes/unmanaged/list'>

export type AccessCodesUnmanagedListResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/unmanaged/list'>>
>

export type AccessCodesUnmanagedUpdateBody =
  RouteRequestBody<'/access_codes/unmanaged/update'>

export type AccessCodesUnmanagedUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/unmanaged/update'>>
>
