import type { ActionAttemptResource } from './resources/action-attempt.js'
import type { SeamHttpActionAttempts } from './routes/index.js'

export interface ResolveActionAttemptOptions {
  timeout?: number
  pollingInterval?: number
}

export const resolveActionAttempt = async <T extends ActionAttemptResource>(
  actionAttempt: T,
  actionAttempts: SeamHttpActionAttempts,
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

const pollActionAttempt = async <T extends ActionAttemptResource>(
  actionAttempt: T,
  actionAttempts: SeamHttpActionAttempts,
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

export const isSeamActionAttemptError = <T extends ActionAttemptResource>(
  error: unknown,
): error is SeamActionAttemptError<T> => {
  return error instanceof SeamActionAttemptError
}

export class SeamActionAttemptError<
  T extends ActionAttemptResource,
> extends Error {
  actionAttempt: T

  constructor(message: string, actionAttempt: T) {
    super(message)
    this.name = this.constructor.name
    this.actionAttempt = actionAttempt
  }
}

export const isSeamActionAttemptFailedError = <T extends ActionAttemptResource>(
  error: unknown,
): error is SeamActionAttemptFailedError<T> => {
  return error instanceof SeamActionAttemptFailedError
}

export class SeamActionAttemptFailedError<
  T extends ActionAttemptResource,
> extends SeamActionAttemptError<T> {
  code: string

  constructor(actionAttempt: FailedActionAttempt<T>) {
    super(actionAttempt.error.message, actionAttempt)
    this.name = this.constructor.name
    this.code = actionAttempt.error.type
  }
}

export const isSeamActionAttemptTimeoutError = <
  T extends ActionAttemptResource,
>(
  error: unknown,
): error is SeamActionAttemptTimeoutError<T> => {
  return error instanceof SeamActionAttemptTimeoutError
}

export class SeamActionAttemptTimeoutError<
  T extends ActionAttemptResource,
> extends SeamActionAttemptError<T> {
  constructor(actionAttempt: T, timeout: number) {
    super(
      `Timed out waiting for action action attempt after ${timeout}ms`,
      actionAttempt,
    )
    this.name = this.constructor.name
  }
}

const isSuccessfulActionAttempt = <T extends ActionAttemptResource>(
  actionAttempt: T,
): actionAttempt is SucceededActionAttempt<T> =>
  actionAttempt.status === 'success'

const isFailedActionAttempt = <T extends ActionAttemptResource>(
  actionAttempt: T,
): actionAttempt is FailedActionAttempt<T> => actionAttempt.status === 'error'

export type SucceededActionAttempt<T extends ActionAttemptResource> = T & {
  status: 'success'
}

export type FailedActionAttempt<T extends ActionAttemptResource> = T & {
  status: 'error'
}
