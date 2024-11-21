// src/http.ts
export interface ClientOptions {
  baseUrl: string
  customHeaders?: HeadersInit
}

export interface RequestConfig {
  headers?: HeadersInit
  credentials?: RequestCredentials
  needsAccessToken?: boolean
}
