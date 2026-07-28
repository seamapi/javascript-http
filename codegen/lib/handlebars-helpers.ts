export const identity = (x: unknown): unknown => x

export const json = (value: string): string => JSON.stringify(value)

export const replaceExtension = (fileName: string, extension: string): string =>
  fileName.replace(/\.[^.]+$/, extension)

/** Formats blueprint documentation as a safe TSDoc comment. */
export const doc = (
  description: string,
  isDeprecated = false,
  deprecationMessage = '',
): string => {
  const lines = description.trim() === '' ? [] : description.trim().split('\n')

  if (isDeprecated) {
    const message = deprecationMessage.trim()
    lines.push(`@deprecated${message === '' ? '' : ` ${message}`}`)
  }

  if (lines.length === 0) return ''

  return [
    '/**',
    ...lines.map((line) => ` * ${escapeComment(line)}`),
    ' */',
  ].join('\n')
}

const escapeComment = (line: string): string => line.replaceAll('*/', '*\\/')
