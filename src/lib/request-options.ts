import type { ResolveActionAttemptOptions } from './resolve-action-attempt.js'

/**
 * Options for how a {@link SeamHttpRequest} is executed.
 */
export interface SeamHttpRequestOptions {
  /**
   * Controls whether to wait for the action attempt to resolve
   * when a request returns an action attempt.
   * Pass a boolean to toggle waiting,
   * or {@link ResolveActionAttemptOptions} to also configure
   * the timeout and polling interval.
   */
  waitForActionAttempt?: boolean | ResolveActionAttemptOptions
}

/**
 * Returns true if the key is the name of a {@link SeamHttpRequestOptions} property.
 */
export const isSeamHttpRequestOption = (
  key: string,
): key is keyof SeamHttpRequestOptions => {
  const keys: Record<keyof SeamHttpRequestOptions, true> = {
    waitForActionAttempt: true,
  }
  return Object.keys(keys).includes(key)
}
