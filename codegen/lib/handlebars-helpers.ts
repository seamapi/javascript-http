export const identity = (x: unknown): unknown => x

export const json = (value: unknown): string => JSON.stringify(value)

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
