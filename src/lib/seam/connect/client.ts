export class SeamHttp {
  static fromApiKey(_apiKey: string): SeamHttp {
    return new SeamHttp()
  }

  static fromClientSessionToken(): SeamHttp {
    return new SeamHttp()
  }

  static async fromPublishableKey(): Promise<SeamHttp> {
    return new SeamHttp()
  }

  workspaces = {
    async get(): Promise<null> {
      return null
    },
  }
}
