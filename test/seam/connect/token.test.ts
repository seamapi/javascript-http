import test from 'ava'

import {
  isApiKey,
  isClientSessionToken,
  isConsoleSessionToken,
  isPersonalAccessToken,
  isPublishableKey,
} from '@seamapi/http/connect'

import { isAccessToken, isJwt, isSeamToken } from 'lib/token.js'

const apiKey = 'seam_apikey1_token'
const accessToken = 'seam_at1_token'
const clientSessionToken = 'seam_cst1_token'
const publishableKey = 'seam_pk1_token'
const jwt = 'ey1.ey2.token'
const unknownToken = 'some-other-token'

test('isApiKey: only matches an api key', (t) => {
  t.true(isApiKey(apiKey))
  t.false(isApiKey(accessToken))
  t.false(isApiKey(clientSessionToken))
  t.false(isApiKey(publishableKey))
  t.false(isApiKey(jwt))
  t.false(isApiKey(unknownToken))
})

test('isAccessToken: matches the access token prefix', (t) => {
  t.true(isAccessToken(accessToken))
  t.false(isAccessToken(apiKey))
  t.false(isAccessToken(jwt))
  t.false(isAccessToken(unknownToken))
})

test('isPersonalAccessToken: matches an access token', (t) => {
  t.true(isPersonalAccessToken(accessToken))
  t.false(isPersonalAccessToken(apiKey))
  t.false(isPersonalAccessToken(clientSessionToken))
  t.false(isPersonalAccessToken(unknownToken))
})

test('isClientSessionToken: matches the client session token prefix', (t) => {
  t.true(isClientSessionToken(clientSessionToken))
  t.false(isClientSessionToken(apiKey))
  t.false(isClientSessionToken(publishableKey))
  t.false(isClientSessionToken(unknownToken))
})

test('isPublishableKey: matches the publishable key prefix', (t) => {
  t.true(isPublishableKey(publishableKey))
  t.false(isPublishableKey(apiKey))
  t.false(isPublishableKey(clientSessionToken))
  t.false(isPublishableKey(unknownToken))
})

test('isJwt: matches the jwt prefix', (t) => {
  t.true(isJwt(jwt))
  t.false(isJwt(apiKey))
  t.false(isJwt(unknownToken))
})

test('isConsoleSessionToken: matches a jwt', (t) => {
  t.true(isConsoleSessionToken(jwt))
  t.false(isConsoleSessionToken(apiKey))
  t.false(isConsoleSessionToken(accessToken))
  t.false(isConsoleSessionToken(unknownToken))
})

test('isSeamToken: matches the seam token prefix', (t) => {
  t.true(isSeamToken(apiKey))
  t.true(isSeamToken(accessToken))
  t.true(isSeamToken(clientSessionToken))
  t.true(isSeamToken(publishableKey))
  t.false(isSeamToken(jwt))
  t.false(isSeamToken(unknownToken))
})
