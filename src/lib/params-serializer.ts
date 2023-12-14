import type { CustomParamsSerializer } from 'axios'

export const paramsSerializer: CustomParamsSerializer = (params) => {
  const searchParams = new URLSearchParams()

  for (const [name, value] of Object.entries(params)) {
    if (value == null) continue

    if (Array.isArray(value)) {
      if (value.length === 0) searchParams.set(name, '')
      if (value.length === 1 && value[0] === '') {
        throw new UnserializableParamError(
          name,
          `is a single element array containing the empty string which is unsupported because it serializes to the empty array`,
        )
      }
      for (const v of value) {
        searchParams.append(name, serialize(name, v))
      }
      continue
    }

    searchParams.set(name, serialize(name, value))
  }

  searchParams.sort()
  return searchParams.toString()
}

const serialize = (k: string, v: unknown): string => {
  if (typeof v === 'string') return v.toString()
  if (typeof v === 'number') return v.toString()
  if (typeof v === 'bigint') return v.toString()
  if (typeof v === 'boolean') return v.toString()
  throw new UnserializableParamError(k, `is a ${typeof v}`)
}

export class UnserializableParamError extends Error {
  constructor(name: string, message: string) {
    super(`Could not serialize parameter: '${name}' ${message}`)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}
