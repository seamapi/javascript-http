
function generateDocstringsForBlueprint(blueprint) {
  blueprint.routes.forEach(route => {
    console.log(generateRouteDocstring(route))
    route.endpoints.forEach(endpoint => {
      console.log(generateEndpointDocstring(endpoint))
    })
    route.subroutes.forEach(subroute => {
      console.log(generateRouteDocstring(subroute))
    })
  })
}

function generateRouteDocstring(route) {
  const docstring = `
/**
 * ${route.name}
 * 
 * Path: ${route.path}
 * 
 * Description: ${route.description ?? "No description provided."}
 * 
 * Namespace: ${route.namespace !== '' ? route.namespace.name : "No namespace"}
 * 
 * Endpoints:
 * ${route.endpoints.map(endpoint => `  - ${endpoint.name}: ${endpoint.description}`).join('\n')}
 */`

  return docstring
}

function generateEndpointDocstring(endpoint) {
  const deprecationNotice = endpoint.isDeprecated === true ? ` (Deprecated: ${endpoint.deprecationMessage})` : ''

  const docstring = `
/**
 * ${endpoint.name}${deprecationNotice}
 * 
 * Path: ${endpoint.path}
 * 
 * Methods: ${endpoint.methods.join(', ')}
 * 
 * Description: ${endpoint.description ?? "No description provided."}
 * 
 * Parameters:
 * ${endpoint.parameters.map(param => `  - ${param.name}: ${param.description}${param.isRequired === true ? ' (Required)' : ''}` +
    `${param.isDeprecated === true ? ` (Deprecated: ${param.deprecationMessage})` : ''}`).join('\n')}
 * 
 * Request: ${endpoint.request.semanticMethod !== '' ? `Semantic Method: ${endpoint.request.semanticMethod}` : "Not specified"}
 * 
 * Response: ${endpoint.response.description ?? "No description provided."}
 */`

  return docstring
}

const exampleRoute = {
  name: "Get Devices",
  path: "/devices",
  description: "Retrieves a list of devices.",
  namespace: null,
  endpoints: [
    {
      name: "List Devices",
      path: "/devices/list",
      methods: ["GET"],
      semanticMethod: "GET",
      preferredMethod: "GET",
      description: "Lists all devices.",
      isDeprecated: false,
      deprecationMessage: "",
      parameters: [
        { name: "limit", isRequired: false, isDeprecated: false, deprecationMessage: "", description: "What are endpoint parameters? How are they differnet from request params?" }
      ],
      request: {
        methods: ["GET"],
        semanticMethod: "GET",
        preferredMethod: "GET",
        parameters: [
          { name: "limit", isRequired: false, isDeprecated: false, deprecationMessage: "", description: "Limit the number of devices returned." }
        ]
      },
      response: {
        description: "A list of devices."
      }
    }
  ],
  subroutes: []
}

const blueprintExample = {
  name: "Device API",
  routes: [exampleRoute]
}

generateDocstringsForBlueprint(blueprintExample)