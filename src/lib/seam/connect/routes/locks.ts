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
  type SeamHttpOptionsWithPersonalAccessToken,
  type SeamHttpRequestOptions,
} from 'lib/seam/connect/options.js'
import {
  limitToSeamHttpRequestOptions,
  parseOptions,
} from 'lib/seam/connect/parse-options.js'
import { resolveActionAttempt } from 'lib/seam/connect/resolve-action-attempt.js'

import { SeamHttpActionAttempts } from './action-attempts.js'
import { SeamHttpClientSessions } from './client-sessions.js'

export class SeamHttpLocks {
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
  ): SeamHttpLocks {
    const constructorOptions = { ...options, client }
    if (!isSeamHttpOptionsWithClient(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing client')
    }
    return new SeamHttpLocks(constructorOptions)
  }

  static fromApiKey(
    apiKey: SeamHttpOptionsWithApiKey['apiKey'],
    options: Omit<SeamHttpOptionsWithApiKey, 'apiKey'> = {},
  ): SeamHttpLocks {
    const constructorOptions = { ...options, apiKey }
    if (!isSeamHttpOptionsWithApiKey(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing apiKey')
    }
    return new SeamHttpLocks(constructorOptions)
  }

  static fromClientSessionToken(
    clientSessionToken: SeamHttpOptionsWithClientSessionToken['clientSessionToken'],
    options: Omit<
      SeamHttpOptionsWithClientSessionToken,
      'clientSessionToken'
    > = {},
  ): SeamHttpLocks {
    const constructorOptions = { ...options, clientSessionToken }
    if (!isSeamHttpOptionsWithClientSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError('Missing clientSessionToken')
    }
    return new SeamHttpLocks(constructorOptions)
  }

  static async fromPublishableKey(
    publishableKey: string,
    userIdentifierKey: string,
    options: SeamHttpFromPublishableKeyOptions = {},
  ): Promise<SeamHttpLocks> {
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
    return SeamHttpLocks.fromClientSessionToken(token, options)
  }

  static fromConsoleSessionToken(
    consoleSessionToken: SeamHttpOptionsWithConsoleSessionToken['consoleSessionToken'],
    workspaceId: SeamHttpOptionsWithConsoleSessionToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithConsoleSessionToken,
      'consoleSessionToken' | 'workspaceId'
    > = {},
  ): SeamHttpLocks {
    const constructorOptions = { ...options, consoleSessionToken, workspaceId }
    if (!isSeamHttpOptionsWithConsoleSessionToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing consoleSessionToken or workspaceId',
      )
    }
    return new SeamHttpLocks(constructorOptions)
  }

  static fromPersonalAccessToken(
    personalAccessToken: SeamHttpOptionsWithPersonalAccessToken['personalAccessToken'],
    workspaceId: SeamHttpOptionsWithPersonalAccessToken['workspaceId'],
    options: Omit<
      SeamHttpOptionsWithPersonalAccessToken,
      'personalAccessToken' | 'workspaceId'
    > = {},
  ): SeamHttpLocks {
    const constructorOptions = { ...options, personalAccessToken, workspaceId }
    if (!isSeamHttpOptionsWithPersonalAccessToken(constructorOptions)) {
      throw new SeamHttpInvalidOptionsError(
        'Missing personalAccessToken or workspaceId',
      )
    }
    return new SeamHttpLocks(constructorOptions)
  }

  async get(body?: LocksGetParams): Promise<LocksGetResponse['device']> {
    const { data } = await this.client.request<LocksGetResponse>({
      url: '/locks/get',
      method: 'post',
      data: body,
    })

    return data.device
  }

  async list(body?: LocksListParams): Promise<LocksListResponse['devices']> {
    const { data } = await this.client.request<LocksListResponse>({
      url: '/locks/list',
      method: 'post',
      data: body,
    })

    return data.devices
  }

  async lockDoor(
    body?: LocksLockDoorBody,
    options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'> = {},
  ): Promise<LocksLockDoorResponse['action_attempt']> {
    const { data } = await this.client.request<LocksLockDoorResponse>({
      url: '/locks/lock_door',
      method: 'post',
      data: body,
    })
    const waitForActionAttempt =
      options.waitForActionAttempt ?? this.defaults.waitForActionAttempt
    if (waitForActionAttempt !== false) {
      return await resolveActionAttempt(
        data.action_attempt,
        SeamHttpActionAttempts.fromClient(this.client, {
          ...this.defaults,
          waitForActionAttempt: false,
        }),
        typeof waitForActionAttempt === 'boolean' ? {} : waitForActionAttempt,
      )
    }
    return data.action_attempt
  }

  async unlockDoor(
    body?: LocksUnlockDoorBody,
    options: Pick<SeamHttpRequestOptions, 'waitForActionAttempt'> = {},
  ): Promise<LocksUnlockDoorResponse['action_attempt']> {
    const { data } = await this.client.request<LocksUnlockDoorResponse>({
      url: '/locks/unlock_door',
      method: 'post',
      data: body,
    })
    const waitForActionAttempt =
      options.waitForActionAttempt ?? this.defaults.waitForActionAttempt
    if (waitForActionAttempt !== false) {
      return await resolveActionAttempt(
        data.action_attempt,
        SeamHttpActionAttempts.fromClient(this.client, {
          ...this.defaults,
          waitForActionAttempt: false,
        }),
        typeof waitForActionAttempt === 'boolean' ? {} : waitForActionAttempt,
      )
    }
    return data.action_attempt
  }
}

export type LocksGetParams = RouteRequestBody<'/locks/get'>

export type LocksGetResponse = SetNonNullable<
  Required<RouteResponse<'/locks/get'>>
>

export type LocksGetOptions = never

export type LocksListParams = RouteRequestBody<'/locks/list'>

export type LocksListResponse = SetNonNullable<
  Required<RouteResponse<'/locks/list'>>
>

export type LocksListOptions = never

export type LocksLockDoorBody = RouteRequestBody<'/locks/lock_door'>

export type LocksLockDoorResponse = SetNonNullable<
  Required<RouteResponse<'/locks/lock_door'>>
>

export type LocksLockDoorOptions = Pick<
  SeamHttpRequestOptions,
  'waitForActionAttempt'
>

export type LocksUnlockDoorBody = RouteRequestBody<'/locks/unlock_door'>

export type LocksUnlockDoorResponse = SetNonNullable<
  Required<RouteResponse<'/locks/unlock_door'>>
>

export type LocksUnlockDoorOptions = Pick<
  SeamHttpRequestOptions,
  'waitForActionAttempt'
>
