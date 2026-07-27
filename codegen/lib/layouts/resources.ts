import type { Blueprint, Resource } from '@seamapi/blueprint'
import { kebabCase, pascalCase } from 'change-case'

export interface ResourceLayoutContext {
  fileName: string
  typeName: string
  resources: Resource[]
}

export interface ResourceIndexLayoutContext {
  resources: Array<Pick<ResourceLayoutContext, 'fileName' | 'typeName'>>
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

  return resourceTypes.map((resourceType) => ({
    fileName: `${kebabCase(resourceType)}.ts`,
    typeName: getResourceTypeName(resourceType),
    resources: resources.filter(
      (resource) => resource.resourceType === resourceType,
    ),
  }))
}
