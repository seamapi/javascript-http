import { createClient } from './client.js'
import { defaultEndpoint, sdkHeaders } from './parse-options.js'

/**
 * Fetches the OpenAPI schema describing the Seam API.
 *
 * @param endpoint - The Seam API endpoint to fetch the schema from.
 * @returns The OpenAPI schema as parsed JSON.
 */
export const getOpenapiSchema = async (
  endpoint = defaultEndpoint,
): Promise<unknown> => {
  const client = createClient({
    axiosOptions: {
      baseURL: endpoint,
      headers: sdkHeaders,
    },
  })
  const { data } = await client.get('/openapi.json')
  return data
}
