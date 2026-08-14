import {
  type Params,
  serializeUrlSearchParams as baseSerializeUrlSearchParams,
  UnserializableParamError,
  updateUrlSearchParams as baseUpdateUrlSearchParams,
} from '@seamapi/url-search-params-serializer'

export const serializeUrlSearchParams = (params: Params): string => {
  const queryString = baseSerializeUrlSearchParams(params)
  if (queryString === '') return ''

  const searchParams = new URLSearchParams(queryString)
  searchParams.set('_strict', 'true')
  return searchParams.toString()
}

export const updateUrlSearchParams = (
  searchParams: URLSearchParams,
  params: Params,
): void => {
  baseUpdateUrlSearchParams(searchParams, params)

  if (searchParams.size > 0) {
    searchParams.set('_strict', 'true')
  }
}

export { type Params, UnserializableParamError }
