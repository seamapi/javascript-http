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

export class SeamHttpAccessCodes {
  client: Axios

  constructor(apiKeyOrOptions: string | SeamHttpOptions) {
    const options = parseOptions(apiKeyOrOptions)
    this.client = createAxiosClient(options)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpAccessCodes {
    const opts = { ...options, client }
    if (!isSeamHttpOptionsWithClient(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpAccessCodes(opts)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpAccessCodes {
    const opts = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpAccessCodes(opts)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpAccessCodes {
    const opts = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpAccessCodes(opts)
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

  async createMultiple(body: AccessCodesCreateMultipleBody): Promise<void> {
    await this.client.request<AccessCodesCreateMultipleResponse>({
      url: '/access_codes/create_multiple',
      method: 'put',
      data: body,
    })
  }

  async delete(body: AccessCodesDeleteBody): Promise<void> {
    await this.client.request<AccessCodesDeleteResponse>({
      url: '/access_codes/delete',
      method: 'post',
      data: body,
    })
  }

  async generateCode(
    params?: AccessCodesGenerateCodeParams,
  ): Promise<AccessCodesGenerateCodeResponse['generated_code']> {
    const { data } = await this.client.request<AccessCodesGenerateCodeResponse>(
      {
        url: '/access_codes/generate_code',
        method: 'get',
        params,
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
      method: 'put',
      data: body,
    })
  }
}

export type AccessCodesCreateBody = SetNonNullable<
  Required<RouteRequestBody<'/access_codes/create'>>
>

export type AccessCodesCreateResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/create'>>
>

export type AccessCodesCreateMultipleBody = SetNonNullable<
  Required<RouteRequestBody<'/access_codes/create_multiple'>>
>

export type AccessCodesCreateMultipleResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/create_multiple'>>
>

export type AccessCodesDeleteBody = SetNonNullable<
  Required<RouteRequestBody<'/access_codes/delete'>>
>

export type AccessCodesDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/delete'>>
>

export type AccessCodesGenerateCodeParams = SetNonNullable<
  Required<RouteRequestParams<'/access_codes/generate_code'>>
>

export type AccessCodesGenerateCodeResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/generate_code'>>
>

export type AccessCodesGetBody = SetNonNullable<
  Required<RouteRequestBody<'/access_codes/get'>>
>

export type AccessCodesGetResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/get'>>
>

export type AccessCodesListBody = SetNonNullable<
  Required<RouteRequestBody<'/access_codes/list'>>
>

export type AccessCodesListResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/list'>>
>

export type AccessCodesPullBackupAccessCodeBody = SetNonNullable<
  Required<RouteRequestBody<'/access_codes/pull_backup_access_code'>>
>

export type AccessCodesPullBackupAccessCodeResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/pull_backup_access_code'>>
>

export type AccessCodesUpdateBody = SetNonNullable<
  Required<RouteRequestBody<'/access_codes/update'>>
>

export type AccessCodesUpdateResponse = SetNonNullable<
  Required<RouteResponse<'/access_codes/update'>>
>
