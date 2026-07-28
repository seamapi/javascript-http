import type { Blueprint, Resource } from '@seamapi/blueprint'
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
  const resources = [
    ...blueprint.resources,
    ...blueprint.events,
    ...blueprint.actionAttempts,
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
