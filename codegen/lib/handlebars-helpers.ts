export const identity = (x: unknown): unknown => x

export const json = (value: string): string => JSON.stringify(value)

export const replaceExtension = (fileName: string, extension: string): string =>
  fileName.replace(/\.[^.]+$/, extension)
