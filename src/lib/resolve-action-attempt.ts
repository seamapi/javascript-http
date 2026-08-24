import { SeamHttpInvalidOptionsError } from './options.js'
import type { ActionAttempt } from './resources/action-attempt.js'

/**
 * Client used to poll action attempts by id, e.g., `SeamHttpActionAttempts`.
 */
export interface ActionAttemptsClient {
  get(parameters: { action_attempt_id: string }): PromiseLike<ActionAttempt>
}

/**
 * Options for waiting until an action attempt resolves.
 */
export interface ResolveActionAttemptOptions {
  /**
   * Maximum time in milliseconds to wait for the action attempt to resolve.
   */
  timeout?: number

  /**
   * Time in milliseconds to wait between polls of the action attempt.
   */
  pollingInterval?: number
}

/**
 * Polls a pending action attempt until it succeeds, fails, or times out.
 *
 * Polling stops as soon as the deadline set by the `timeout` option passes,
 * and every wait polls at least once,
 * even when the `timeout` is shorter than the `pollingInterval`.
 *
 * @returns The succeeded action attempt.
 * @throws {@link SeamActionAttemptFailedError} if the action attempt fails.
 * @throws {@link SeamActionAttemptTimeoutError} if the action attempt
 * does not resolve within the timeout.
 * @throws {@link SeamHttpInvalidOptionsError} if the timeout is negative
 * or the pollingInterval is not greater than zero.
 */
export const resolveActionAttempt = async <T extends ActionAttempt>(
  actionAttempt: T,
  actionAttempts: ActionAttemptsClient,
  { timeout = 10_000, pollingInterval = 1_000 }: ResolveActionAttemptOptions,
): Promise<SucceededActionAttempt<T>> => {
  if (Number.isNaN(timeout) || timeout < 0) {
    throw new SeamHttpInvalidOptionsError(
      `The timeout option must not be negative, got ${timeout}`,
    )
  }

  if (Number.isNaN(pollingInterval) || pollingInterval <= 0) {
    throw new SeamHttpInvalidOptionsError(
      `The pollingInterval option must be greater than zero, got ${pollingInterval}`,
    )
  }

  const deadline = Date.now() + timeout
  let currentActionAttempt = actionAttempt

  while (true) {
    if (isSuccessfulActionAttempt(currentActionAttempt)) {
      return currentActionAttempt
    }

    if (isFailedActionAttempt(currentActionAttempt)) {
      throw new SeamActionAttemptFailedError(currentActionAttempt)
    }

    const remaining = deadline - Date.now()
    if (remaining <= 0) {
      throw new SeamActionAttemptTimeoutError<T>(currentActionAttempt, timeout)
    }

    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(pollingInterval, remaining)),
    )

    currentActionAttempt = (await actionAttempts.get({
      action_attempt_id: currentActionAttempt.action_attempt_id,
    })) as unknown as T
  }
}

/**
 * Returns true if the error is a {@link SeamActionAttemptError}.
 */
export const isSeamActionAttemptError = <T extends ActionAttempt>(
  error: unknown,
): error is SeamActionAttemptError<T> => {
  return error instanceof SeamActionAttemptError
}

/**
 * Error relating to an action attempt.
 */
export class SeamActionAttemptError<T extends ActionAttempt> extends Error {
  actionAttempt: T

  constructor(message: string, actionAttempt: T) {
    super(message)
    this.name = this.constructor.name
    this.actionAttempt = actionAttempt
  }
}

/**
 * Returns true if the error is a {@link SeamActionAttemptFailedError}.
 */
export const isSeamActionAttemptFailedError = <T extends ActionAttempt>(
  error: unknown,
): error is SeamActionAttemptFailedError<T> => {
  return error instanceof SeamActionAttemptFailedError
}

/**
 * Error thrown when an action attempt fails.
 */
export class SeamActionAttemptFailedError<
  T extends ActionAttempt,
> extends SeamActionAttemptError<T> {
  /**
   * Error type returned by the Seam API for the failed action attempt.
   */
  code: string

  constructor(actionAttempt: FailedActionAttempt<T>) {
    super(actionAttempt.error.message, actionAttempt)
    this.name = this.constructor.name
    this.code = actionAttempt.error.type
  }
}

/**
 * Returns true if the error is a {@link SeamActionAttemptTimeoutError}.
 */
export const isSeamActionAttemptTimeoutError = <T extends ActionAttempt>(
  error: unknown,
): error is SeamActionAttemptTimeoutError<T> => {
  return error instanceof SeamActionAttemptTimeoutError
}

/**
 * Error thrown when an action attempt does not resolve within the timeout.
 */
export class SeamActionAttemptTimeoutError<
  T extends ActionAttempt,
> extends SeamActionAttemptError<T> {
  constructor(actionAttempt: T, timeout: number) {
    super(
      `Timed out waiting for action attempt after ${timeout}ms`,
      actionAttempt,
    )
    this.name = this.constructor.name
  }
}

const isSuccessfulActionAttempt = <T extends ActionAttempt>(
  actionAttempt: T,
): actionAttempt is SucceededActionAttempt<T> =>
  actionAttempt.status === 'success'

const isFailedActionAttempt = <T extends ActionAttempt>(
  actionAttempt: T,
): actionAttempt is FailedActionAttempt<T> => actionAttempt.status === 'error'

/**
 * An action attempt that has succeeded.
 */
export type SucceededActionAttempt<T extends ActionAttempt> = T & {
  status: 'success'
}

/**
 * An action attempt that has failed.
 */
export type FailedActionAttempt<T extends ActionAttempt> = T & {
  status: 'error'
}
