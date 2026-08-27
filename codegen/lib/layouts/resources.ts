import type {
  ActionAttemptStatus,
  Blueprint,
  EnumProperty,
  Property,
  Resource,
} from '@seamapi/blueprint'
import { kebabCase, pascalCase } from 'change-case'

export interface ResourceLayoutContext {
  fileName: string
  typeName: string
  resources: Resource[]
  isBatch: boolean
  batchResources: BatchResourceLayoutContext[]
}

export interface ResourceIndexLayoutContext {
  resources: Array<Pick<ResourceLayoutContext, 'fileName' | 'typeName'>>
}

interface BatchResourceLayoutContext {
  batchKey: string
  fileName: string
  typeName: string
}

export const getResourceTypeName = (resourceType: string): string =>
  resourceType === 'event' ? 'SeamEvent' : pascalCase(resourceType)

export const getResourceLayoutContexts = (
  blueprint: Blueprint,
): ResourceLayoutContext[] => {
  // Events and action attempts are discriminated unions built from the
  // top-level blueprint collections. The generic resources sharing those
  // resource types have all-optional properties, and including one as a union
  // member would defeat narrowing on the discriminant.
  const discriminatedResourceTypes = new Set<string>(
    [...blueprint.events, ...blueprint.actionAttempts].map(
      ({ resourceType }) => resourceType,
    ),
  )
  const resources = [
    ...blueprint.resources.filter(
      ({ resourceType }) => !discriminatedResourceTypes.has(resourceType),
    ),
    ...blueprint.events,
    ...blueprint.actionAttempts.flatMap(expandActionAttemptByStatus),
  ]
  const resourceTypes = [
    ...new Set(resources.map(({ resourceType }) => resourceType)),
  ]
  const batchResources = getBatchResourceLayoutContexts(resources)

  return resourceTypes.map((resourceType) => ({
    fileName: `${kebabCase(resourceType)}.ts`,
    typeName: getResourceTypeName(resourceType),
    resources: resources.filter(
      (resource) => resource.resourceType === resourceType,
    ),
    isBatch: resourceType === 'batch',
    batchResources: resourceType === 'batch' ? batchResources : [],
  }))
}

const expandActionAttemptByStatus = (resource: Resource): Resource[] => {
  const statusProperty = resource.properties.find(
    (property): property is EnumProperty =>
      property.name === 'status' && property.format === 'enum',
  )
  if (statusProperty == null) return [resource]

  return statusProperty.values.map(({ name }) => {
    const status = name as ActionAttemptStatus
    return {
      ...resource,
      properties: resource.properties.map((property): Property => {
        if (property === statusProperty) {
          return {
            ...statusProperty,
            values: statusProperty.values.filter(
              (value) => value.name === status,
            ),
          }
        }
        const { actionAttemptStatuses } = property
        if (actionAttemptStatuses == null) return property
        if (actionAttemptStatuses.includes(status)) return property
        const nullRenderedProperty: Property & { renderAsNull: true } = {
          ...property,
          isNullable: false,
          renderAsNull: true,
        }
        return nullRenderedProperty
      }),
    }
  })
}

const getBatchResourceLayoutContexts = (
  resources: Resource[],
): BatchResourceLayoutContext[] => {
  const batch = resources.find(({ resourceType }) => resourceType === 'batch')
  if (batch == null) return []

  return batch.properties.flatMap((property) => {
    if (!('resourceType' in property)) return []
    return [
      {
        batchKey: property.name,
        fileName: `${kebabCase(property.resourceType)}.js`,
        typeName: getResourceTypeName(property.resourceType),
      },
    ]
  })
}
