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
 * @returns The succeeded action attempt.
 * @throws {@link SeamActionAttemptFailedError} if the action attempt fails.
 * @throws {@link SeamActionAttemptTimeoutError} if the action attempt
 * does not resolve within the timeout.
 */
export const resolveActionAttempt = async <T extends ActionAttempt>(
  actionAttempt: T,
  actionAttempts: ActionAttemptsClient,
  { timeout = 10_000, pollingInterval = 1_000 }: ResolveActionAttemptOptions,
): Promise<SucceededActionAttempt<T>> => {
  let timeoutRef
  const timeoutPromise = new Promise<SucceededActionAttempt<T>>(
    (_resolve, reject) => {
      timeoutRef = globalThis.setTimeout(() => {
        reject(new SeamActionAttemptTimeoutError<T>(actionAttempt, timeout))
      }, timeout)
    },
  )

  try {
    return await Promise.race([
      pollActionAttempt<T>(actionAttempt, actionAttempts, { pollingInterval }),
      timeoutPromise,
    ])
  } finally {
    if (timeoutRef != null) globalThis.clearTimeout(timeoutRef)
  }
}

const pollActionAttempt = async <T extends ActionAttempt>(
  actionAttempt: T,
  actionAttempts: ActionAttemptsClient,
  options: Pick<ResolveActionAttemptOptions, 'pollingInterval'>,
): Promise<SucceededActionAttempt<T>> => {
  if (isSuccessfulActionAttempt(actionAttempt)) {
    return actionAttempt
  }

  if (isFailedActionAttempt(actionAttempt)) {
    throw new SeamActionAttemptFailedError(actionAttempt)
  }

  await new Promise((resolve) => setTimeout(resolve, options.pollingInterval))

  const nextActionAttempt = await actionAttempts.get({
    action_attempt_id: actionAttempt.action_attempt_id,
  })

  return await pollActionAttempt(
    nextActionAttempt as unknown as T,
    actionAttempts,
    options,
  )
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
      `Timed out waiting for action action attempt after ${timeout}ms`,
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
