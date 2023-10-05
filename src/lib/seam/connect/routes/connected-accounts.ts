/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import type {
  RouteRequestBody,
  RouteRequestParams,
  RouteResponse,
} from '@seamapi/types/connect'
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

export class SeamHttpConnectedAccounts {
  client: Client

  constructor(apiKeyOrOptions: string | SeamHttpOptions = {}) {
    const options = parseOptions(apiKeyOrOptions)
    this.client = createClient(options)
  }

  static fromClient(
    client: SeamHttpOptionsWithClient['client'],
    options: Omit<SeamHttpOptionsWithClient, 'client'> = {},
  ): SeamHttpConnectedAccounts {
    const opts = { ...options, client }
    if (!isSeamHttpOptionsWithClient(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpConnectedAccounts(opts)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpConnectedAccounts {
    const opts = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpConnectedAccounts(opts)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpConnectedAccounts {
    const opts = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(opts)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpConnectedAccounts(opts)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: ClientOptions = {},
  ): Promise<SeamHttpConnectedAccounts> {
    const opts = parseOptions(options)
    const client = createClient({ ...opts, publishableKey })
    const clientSessions = SeamHttpClientSessions.fromClient(client)
    // TODO: clientSessions.getOrCreate({ user_identifier_key: userIdentifierKey })
    const { token } = await clientSessions.create({
      user_identifier_key: userIdentifierKey,
    })
    return SeamHttpConnectedAccounts.fromClientSessionToken(token, options)
  }

  async delete(body: ConnectedAccountsDeleteBody): Promise<void> {
    await this.client.request<ConnectedAccountsDeleteResponse>({
      url: '/connected_accounts/delete',
      method: 'post',
      data: body,
    })
  }

  async get(
    body: ConnectedAccountsGetBody,
  ): Promise<ConnectedAccountsGetResponse['connected_account']> {
    const { data } = await this.client.request<ConnectedAccountsGetResponse>({
      url: '/connected_accounts/get',
      method: 'post',
      data: body,
    })
    return data.connected_account
  }

  async list(
    params?: ConnectedAccountsListParams,
  ): Promise<ConnectedAccountsListResponse['connected_accounts']> {
    const { data } = await this.client.request<ConnectedAccountsListResponse>({
      url: '/connected_accounts/list',
      method: 'get',
      params,
    })
    return data.connected_accounts
  }
}

export type ConnectedAccountsDeleteBody =
  RouteRequestBody<'/connected_accounts/delete'>

export type ConnectedAccountsDeleteResponse = SetNonNullable<
  Required<RouteResponse<'/connected_accounts/delete'>>
>

export type ConnectedAccountsGetBody =
  RouteRequestBody<'/connected_accounts/get'>

export type ConnectedAccountsGetResponse = SetNonNullable<
  Required<RouteResponse<'/connected_accounts/get'>>
>

export type ConnectedAccountsListParams =
  RouteRequestParams<'/connected_accounts/list'>

export type ConnectedAccountsListResponse = SetNonNullable<
  Required<RouteResponse<'/connected_accounts/list'>>
>
