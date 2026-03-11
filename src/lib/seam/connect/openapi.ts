import { createClient } from './client.js'
import { defaultEndpoint, sdkHeaders } from './parse-options.js'

export const getOpenapiSchema = async (
  endpoint = defaultEndpoint,
): Promise<Record<string, unknown>> => {
  const client = createClient({
    axiosOptions: {
      baseURL: endpoint,
      headers: sdkHeaders,
    },
  })
  const { data } = await client.get<Record<string, unknown>>('/openapi.json')
  return data
}
