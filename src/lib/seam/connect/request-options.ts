import type { ResolveActionAttemptOptions } from './resolve-action-attempt.js'

export interface SeamHttpRequestOptions {
  waitForActionAttempt?: boolean | ResolveActionAttemptOptions
}

export const isSeamHttpRequestOption = (
  key: string,
): key is keyof SeamHttpRequestOptions => {
  const keys: Record<keyof SeamHttpRequestOptions, true> = {
    waitForActionAttempt: true,
  }
  return Object.keys(keys).includes(key)
}
