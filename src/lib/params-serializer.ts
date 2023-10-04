import type { CustomParamsSerializer } from 'axios'

export const paramsSerializer: CustomParamsSerializer = (params) => {
  const searchParams = new URLSearchParams()

  for (const [name, value] of Object.entries(params)) {
    if (value == null) continue

    if (Array.isArray(value)) {
      if (value.length === 0) searchParams.set(name, '')
      for (const v of value) {
        throwIfUnserializeable(name, v)
        searchParams.append(name, v)
      }
      continue
    }

    throwIfUnserializeable(name, value)
    searchParams.set(name, value)
  }

  searchParams.sort()
  return searchParams.toString()
}

const throwIfUnserializeable = (k, v): void => {
  if (v == null) {
    throw new UnserializeableParamError(
      `Parameter ${k} is ${v} or contains ${v}`,
    )
  }

  if (typeof v === 'function') {
    throw new UnserializeableParamError(
      `Parameter ${k} is a function or contains a function`,
    )
  }

  if (typeof v === 'object') {
    throw new UnserializeableParamError(
      `Parameter ${k} is an object or contains an object`,
    )
  }
}

export class UnserializeableParamError extends Error {
  constructor(message: string) {
    super(`Could not serialize parameter: ${message}`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
