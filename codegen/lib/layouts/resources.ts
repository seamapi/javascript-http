import type {
  ActionAttempt,
  Blueprint,
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
    ...blueprint.actionAttempts.map(normalizeActionAttempt),
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

// The blueprint merges the per-status variants and drops the nullability.
const nullWhilePendingDoc =
  'Null while the action attempt is pending or when this value does not apply.'

const normalizeActionAttempt = (resource: ActionAttempt): ActionAttempt => ({
  ...resource,
  properties: resource.properties.map((property) =>
    property.name === 'error' || property.name === 'result'
      ? toStatusDependentProperty(property)
      : property,
  ),
})

const toStatusDependentProperty = (property: Property): Property => ({
  ...property,
  isNullable: true,
  description: [property.description, nullWhilePendingDoc]
    .filter((part) => part !== '')
    .join(' '),
})

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
