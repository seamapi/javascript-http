/*
 * Automatically generated by generate-routes.ts.
 * Do not edit this file or add other files to this directory.
 */

import { Axios } from 'axios'

import { createAxiosClient } from 'lib/seam/connect/axios.js'
import type { SeamHttpOptions } from 'lib/seam/connect/client-options.js'
import { parseOptions } from 'lib/seam/connect/parse-options.js'

export class SeamHttpThermostats {
  client: Axios

  constructor(apiKeyOrOptionsOrClient: Axios | string | SeamHttpOptions) {
    if (apiKeyOrOptionsOrClient instanceof Axios) {
      this.client = apiKeyOrOptionsOrClient
      return
    }

    const options = parseOptions(apiKeyOrOptionsOrClient)
    this.client = createAxiosClient(options)
  }
}
