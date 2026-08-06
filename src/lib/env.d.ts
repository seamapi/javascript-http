declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SEAM_API_KEY?: string
      SEAM_API_URL?: string
      SEAM_ENDPOINT?: string
      SEAM_PERSONAL_ACCESS_TOKEN?: string
      SEAM_WORKSPACE_ID?: string
    }
  }
}

export {}
