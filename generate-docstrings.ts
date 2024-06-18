
import { pascalCase } from "change-case";
import type { Endpoint } from "generate-routes.js"

const generateDocstringForEndpoint = (endpoint: Endpoint): string => {
  const responseType = `${pascalCase(endpoint.namespace)}${pascalCase(endpoint.name)}Response`;
  const paramType = endpoint.requestFormat === 'params' ? 'ParamsType' : 'BodyType'; 


  return `
/**
 * Handles ${endpoint.method} requests to ${endpoint.path}.
 *
 * @param {${paramType}} request - The request ${endpoint.requestFormat}.
 * @returns {Promise<${responseType}>} 
 */
`;
};
