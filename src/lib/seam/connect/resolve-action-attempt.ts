import type {
  ActionAttempt,
  FailedActionAttempt,
  SuccessfulActionAttempt,
} from './action-attempt-types.js'
import type { SeamHttp } from './seam-http.js'

interface Options {
  timeout?: number
  pollingInterval?: number
}

export const resolveActionAttempt = async <T extends ActionAttempt>(
  actionAttemptOrPromise: T | Promise<T>,
  seam: SeamHttp,
  { timeout = 5000, pollingInterval = 500 }: Options = {},
): Promise<SuccessfulActionAttempt<T>> => {
  const actionAttempt = await actionAttemptOrPromise
  let timeoutRef
  const timeoutPromise = new Promise<SuccessfulActionAttempt<T>>(
    (_resolve, reject) => {
      timeoutRef = globalThis.setTimeout(() => {
        reject(new SeamActionAttemptTimeoutError<T>(actionAttempt, timeout))
      }, timeout)
    },
  )

  try {
    return await Promise.race([
      pollActionAttempt<T>(actionAttempt, seam, { pollingInterval }),
      timeoutPromise,
    ])
  } finally {
    if (timeoutRef != null) globalThis.clearTimeout(timeoutRef)
  }
}

const pollActionAttempt = async <T extends ActionAttempt>(
  actionAttempt: T,
  seam: SeamHttp,
  options: Pick<Options, 'pollingInterval'>,
): Promise<SuccessfulActionAttempt<T>> => {
  if (isSuccessfulActionAttempt(actionAttempt)) {
    return actionAttempt
  }

  if (isFailedActionAttempt(actionAttempt)) {
    throw new SeamActionAttemptFailedError(actionAttempt)
  }

  await new Promise((resolve) => setTimeout(resolve, options.pollingInterval))

  const nextActionAttempt = await seam.actionAttempts.get({
    action_attempt_id: actionAttempt.action_attempt_id,
  })

  return await pollActionAttempt(
    nextActionAttempt as unknown as T,
    seam,
    options,
  )
}

export const isSeamActionAttemptError = <T extends ActionAttempt>(
  error: unknown,
): error is SeamActionAttemptError<T> => {
  return error instanceof SeamActionAttemptError
}

export class SeamActionAttemptError<T extends ActionAttempt> extends Error {
  actionAttempt: T

  constructor(message: string, actionAttempt: T) {
    super(message)
    this.name = this.constructor.name
    this.actionAttempt = actionAttempt
    Error.captureStackTrace(this, this.constructor)
  }
}

export const isSeamActionAttemptFailedError = <T extends ActionAttempt>(
  error: unknown,
): error is SeamActionAttemptFailedError<T> => {
  return error instanceof SeamActionAttemptFailedError
}

export class SeamActionAttemptFailedError<
  T extends ActionAttempt,
> extends SeamActionAttemptError<T> {
  code: string

  constructor(actionAttempt: FailedActionAttempt<T>) {
    super(actionAttempt.error.message, actionAttempt)
    this.name = this.constructor.name
    this.code = actionAttempt.error.type
    Error.captureStackTrace(this, this.constructor)
  }
}

export const isSeamActionAttemptTimeoutError = <T extends ActionAttempt>(
  error: unknown,
): error is SeamActionAttemptTimeoutError<T> => {
  return error instanceof SeamActionAttemptTimeoutError
}

export class SeamActionAttemptTimeoutError<
  T extends ActionAttempt,
> extends SeamActionAttemptError<T> {
  constructor(actionAttempt: T, timeout: number) {
    super(
      `Timed out waiting for action action attempt after ${timeout}ms`,
      actionAttempt,
    )
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

const isSuccessfulActionAttempt = <T extends ActionAttempt>(
  actionAttempt: T,
): actionAttempt is SuccessfulActionAttempt<T> =>
  actionAttempt.status === 'success'

const isFailedActionAttempt = <T extends ActionAttempt>(
  actionAttempt: T,
): actionAttempt is FailedActionAttempt<T> => actionAttempt.status === 'error'
