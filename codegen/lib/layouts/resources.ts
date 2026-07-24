import type { Blueprint, Property, Resource } from '@seamapi/blueprint'
import { kebabCase, pascalCase } from 'change-case'

export interface ResourceLayoutContext {
  fileName: string
  typeName: string
  type: string
}

export const getResourceTypeName = (resourceType: string): string =>
  `${pascalCase(resourceType)}Resource`

export const getResourceLayoutContexts = (
  blueprint: Blueprint,
): ResourceLayoutContext[] => {
  const resources = [
    ...blueprint.resources,
    ...blueprint.events,
    ...blueprint.actionAttempts,
  ]
  const resourceTypes = [
    ...new Set(resources.map(({ resourceType }) => resourceType)),
  ]

  return ['unknown', ...resourceTypes].map((resourceType) => {
    if (resourceType === 'unknown') {
      return {
        fileName: 'unknown.ts',
        typeName: 'UnknownResource',
        type: 'Record<string, unknown>',
      }
    }

    const type = resources
      .filter((resource) => resource.resourceType === resourceType)
      .map(renderResource)
      .join(' | ')

    return {
      fileName: `${kebabCase(resourceType)}.ts`,
      typeName: getResourceTypeName(resourceType),
      type: type || 'Record<string, unknown>',
    }
  })
}

const renderResource = (resource: Resource): string =>
  renderObject(resource.properties, renderProperty)

const renderObject = <T extends { name: string; isOptional: boolean }>(
  members: T[],
  render: (member: T) => string,
): string =>
  `{ ${members
    .map(
      (member) =>
        `${JSON.stringify(member.name)}${member.isOptional ? '?' : ''}: ${render(member)}${member.isOptional ? ' | undefined' : ''}`,
    )
    .join('; ')} }`

const renderProperty = (property: Property): string => {
  let type: string
  if (property.format === 'object') {
    type = renderObject(property.properties, renderProperty)
  } else if (property.format === 'list') {
    if (property.itemFormat === 'object') {
      type = `Array<${renderObject(property.itemProperties, renderProperty)}>`
    } else if (property.itemFormat === 'discriminated_object') {
      type = `Array<${property.variants
        .map(({ properties }) => renderObject(properties, renderProperty))
        .join(' | ')}>`
    } else {
      type = `Array<${renderScalar(property.itemFormat, property)}>`
    }
  } else {
    type = renderScalar(property.format, property)
  }
  return property.isNullable ? `${type} | null` : type
}

const renderScalar = (format: string, value: unknown): string => {
  if (format === 'boolean') return 'boolean'
  if (format === 'number') return 'number'
  if (format === 'record') return 'Record<string, unknown>'
  if (format === 'enum') {
    const enumValue = value as {
      values?: Array<{ name: string }>
      itemEnumValues?: Array<{ name: string }>
    }
    const values = enumValue.values ?? enumValue.itemEnumValues ?? []
    return values.length === 0
      ? 'string'
      : values.map(({ name }) => JSON.stringify(name)).join(' | ')
  }
  return 'string'
}
