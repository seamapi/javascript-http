import type { Blueprint, Resource } from '@seamapi/blueprint'
import { kebabCase, pascalCase } from 'change-case'

export interface ResourceLayoutContext {
  fileName: string
  typeName: string
  resources: Resource[]
  isUnknown: boolean
}

export interface ResourceIndexLayoutContext {
  resources: Array<Pick<ResourceLayoutContext, 'fileName' | 'typeName'>>
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

  return [
    {
      fileName: 'unknown.ts',
      typeName: 'UnknownResource',
      resources: [],
      isUnknown: true,
    },
    ...resourceTypes.map((resourceType) => ({
      fileName: `${kebabCase(resourceType)}.ts`,
      typeName: getResourceTypeName(resourceType),
      resources: resources.filter(
        (resource) => resource.resourceType === resourceType,
      ),
      isUnknown: false,
    })),
  ]
}
