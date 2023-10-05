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

import { SeamHttpAccessCodesUnmanaged } from './access-codes-unmanaged.js'
import { SeamHttpClientSessions } from './client-sessions.js'

export class SeamHttpAccessCodes {
  client: Client

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const clientOptions = parseOptions(apiKeyOrOptions)
    this.client = createClient(clientOptions)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpAccessCodes {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpAccessCodes(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpAccessCodes {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpAccessCodes(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpAccessCodes {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpAccessCodes(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpAccessCodes> {
    warnOnInsecureuserIdentifierKey(userIdentifierKey)
    const clientOptions = parseOptions({ ...options, publishableKey })
    const client = createClient(clientOptions)
    const clientSessions = SeamHttpClientSessions.fromClient(client)
    const { token } = await clientSessions.getOrCreate({
      user_identifier_key: userIdentifierKey,
    })
    return SeamHttpAccessCodes.fromClientSessionToken(token, options)
  }

  get unmanaged(): SeamHttpAccessCodesUnmanaged {
    return SeamHttpAccessCodesUnmanaged.fromClient(this.client)
  }

  async create(
    body: AccessCodesCreateBody,
  ): Promise<AccessCodesCreateResponse['access_code']> {
    const { data } = await this.client.request<AccessCodesCreateResponse>({
      url: '/access_codes/create',
      method: 'post',
      data: body,
    })
    return data.access_code
  }

  async createMultiple(
    body: AccessCodesCreateMultipleBody,
  ): Promise<AccessCodesCreateMultipleResponse['access_codes']> {
    const { data } =
      await this.client.request<AccessCodesCreateMultipleResponse>({
        url: '/access_codes/create_multiple',
        method: 'post',
        data: body,
      })
    return data.access_codes
  }

  async delete(body: AccessCodesDeleteBody): Promise<void> {
    await this.client.request<AccessCodesDeleteResponse>({
      url: '/access_codes/delete',
      method: 'post',
      data: body,
    })
  }

  async generateCode(
    body: AccessCodesGenerateCodeBody,
  ): Promise<AccessCodesGenerateCodeResponse['generated_code']> {
    const { data } = await this.client.request<AccessCodesGenerateCodeResponse>(
      {
        url: '/access_codes/generate_code',
        method: 'post',
        data: body,
      },
    )
    return data.generated_code
  }

  async get(
    body: AccessCodesGetBody,
  ): Promise<AccessCodesGetResponse['access_code']> {
    const { data } = await this.client.request<AccessCodesGetResponse>({
      url: '/access_codes/get',
      method: 'post',
      data: body,
    })
    return data.access_code
  }

  async list(
    body: AccessCodesListBody,
  ): Promise<AccessCodesListResponse['access_codes']> {
    const { data } = await this.client.request<AccessCodesListResponse>({
      url: '/access_codes/list',
      method: 'post',
      data: body,
    })
    return data.access_codes
  }

  async pullBackupAccessCode(
    body: AccessCodesPullBackupAccessCodeBody,
  ): Promise<AccessCodesPullBackupAccessCodeResponse['backup_access_code']> {
    const { data } =
      await this.client.request<AccessCodesPullBackupAccessCodeResponse>({
        url: '/access_codes/pull_backup_access_code',
        method: 'post',
        data: body,
      })
    return data.backup_access_code
  }

  async update(body: AccessCodesUpdateBody): Promise<void> {
    await this.client.request<AccessCodesUpdateResponse>({
      url: '/access_codes/update',
      method: 'post',
      data: body,
    })
  }
}

export type AccessCodesCreateBody = RouteRequestBody<'/access_codes/create'>

export type AccessCodesCreateResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/create'>>
>

export type AccessCodesCreateMultipleBody =
  RouteRequestBody<'/access_codes/create_multiple'>

export type AccessCodesCreateMultipleResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/create_multiple'>>
>

export type AccessCodesDeleteBody = RouteRequestBody<'/access_codes/delete'>

export type AccessCodesDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/delete'>>
>

export type AccessCodesGenerateCodeBody =
  RouteRequestBody<'/access_codes/generate_code'>

export type AccessCodesGenerateCodeResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/generate_code'>>
>

export type AccessCodesGetBody = RouteRequestBody<'/access_codes/get'>

export type AccessCodesGetResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/get'>>
>

export type AccessCodesListBody = RouteRequestBody<'/access_codes/list'>

export type AccessCodesListResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/list'>>
>

export type AccessCodesPullBackupAccessCodeBody =
  RouteRequestBody<'/access_codes/pull_backup_access_code'>

export type AccessCodesPullBackupAccessCodeResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/pull_backup_access_code'>>
>

export type AccessCodesUpdateBody = RouteRequestBody<'/access_codes/update'>

export type AccessCodesUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/update'>>
>
