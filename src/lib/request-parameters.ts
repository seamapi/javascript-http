export type RequireAtLeastOne<
  T,
  Keys extends keyof T = keyof T,
> = Keys extends keyof T
  ? { [Key in Keys]-?: Exclude<T[Key], undefined> } & Partial<Omit<T, Keys>>
  : never

export const assertValidRequestParameters = (
  parameters: unknown,
  path: string,
  hasRequiredParameters: boolean,
  requiredParameterNames: string[],
): void => {
  if (parameters === undefined) {
    if (hasRequiredParameters) {
      throw new TypeError(`Parameters are required for ${path}`)
    }
    return
  }

  if (
    parameters === null ||
    typeof parameters !== 'object' ||
    Array.isArray(parameters)
  ) {
    throw new TypeError(`Parameters for ${path} must be an object`)
  }

  const parameterValues = parameters as Record<string, unknown>
  const missingParameterNames = requiredParameterNames.filter(
    (name) => parameterValues[name] === undefined,
  )
  if (missingParameterNames.length > 0) {
    throw new TypeError(
      `Required parameters missing for ${path}: ${missingParameterNames.join(', ')}`,
    )
  }

  if (
    hasRequiredParameters &&
    Object.values(parameterValues).every((value) => value === undefined)
  ) {
    throw new TypeError(`At least one parameter is required for ${path}`)
  }
}
