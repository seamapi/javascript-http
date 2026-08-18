export const identity = (x: unknown): unknown => x

export const json = (value: unknown): string => JSON.stringify(value)

export const jsonSchemaType = (type: string): string => {
  switch (type) {
    case 'string':
    case 'boolean':
      return type
    case 'number':
    case 'integer':
      return 'number'
    case 'object':
      return 'Record<string, unknown>'
    case 'array':
      return 'unknown[]'
    default:
      throw new Error(`Unsupported JSON Schema type: ${type}`)
  }
}

export const replaceExtension = (fileName: string, extension: string): string =>
  fileName.replace(/\.[^.]+$/, extension)

export const trim = (value = ''): string => value.trim()

export const lines = (value = ''): string[] => {
  const trimmed = trim(value)
  return trimmed === '' ? [] : trimmed.split('\n')
}

export const replaceAll = (
  value: string,
  searchValue: string,
  replaceValue: string,
): string => value.replaceAll(searchValue, replaceValue)
