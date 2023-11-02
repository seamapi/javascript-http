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

export class SeamHttpAcsCredentials {
  client: Client

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const clientOptions = parseOptions(apiKeyOrOptions)
    this.client = createClient(clientOptions)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpAcsCredentials {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpAcsCredentials(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpAcsCredentials {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpAcsCredentials(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpAcsCredentials {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpAcsCredentials(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpAcsCredentials> {
    warnOnInsecureuserIdentifierKey(userIdentifierKey)
    const clientOptions = parseOptions({ ...options, publishableKey })
    const client = createClient(clientOptions)
    const clientSessions = SeamHttpClientSessions.fromClient(client)
    const { token } = await clientSessions.getOrCreate({
      user_identifier_key: userIdentifierKey,
    })
    return SeamHttpAcsCredentials.fromClientSessionToken(token, options)
  }

  async create(
    body?: AcsCredentialsCreateBody,
  ): Promise<AcsCredentialsCreateResponse['acs_credential']> {
    const { data } = await this.client.request<AcsCredentialsCreateResponse>({
      url: '/acs/credentials/create',
      method: 'post',
      data: body,
    })
    return data.acs_credential
  }

  async delete(body?: AcsCredentialsDeleteBody): Promise<void> {
    await this.client.request<AcsCredentialsDeleteResponse>({
      url: '/acs/credentials/delete',
      method: 'post',
      data: body,
    })
  }

  async get(
    body?: AcsCredentialsGetParams,
  ): Promise<AcsCredentialsGetResponse['acs_credential']> {
    const { data } = await this.client.request<AcsCredentialsGetResponse>({
      url: '/acs/credentials/get',
      method: 'post',
      data: body,
    })
    return data.acs_credential
  }

  async list(
    body?: AcsCredentialsListParams,
  ): Promise<AcsCredentialsListResponse['acs_credentials']> {
    const { data } = await this.client.request<AcsCredentialsListResponse>({
      url: '/acs/credentials/list',
      method: 'post',
      data: body,
    })
    return data.acs_credentials
  }
}

export type AcsCredentialsCreateBody =
  RouteRequestBody<'/acs/credentials/create'>

export type AcsCredentialsCreateResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/create'>>
>

export type AcsCredentialsDeleteBody =
  RouteRequestBody<'/acs/credentials/delete'>

export type AcsCredentialsDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/delete'>>
>

export type AcsCredentialsGetParams = RouteRequestBody<'/acs/credentials/get'>

export type AcsCredentialsGetResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/get'>>
>

export type AcsCredentialsListParams = RouteRequestBody<'/acs/credentials/list'>

export type AcsCredentialsListResponse = SetNonNullable<
  Required<RouteResponse<'/acs/credentials/list'>>
>
