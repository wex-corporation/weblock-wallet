// src/clients/http.ts

import { SDKError, SDKOptions, SDKErrorCode } from '@/types'
import { LocalForage } from '@/utils/storage'

interface RequestConfig {
  headers?: HeadersInit
  credentials?: RequestCredentials
  needsAccessToken?: boolean
}

export class HttpClient {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly orgHost: string

  constructor(options: SDKOptions) {
    this.baseUrl = this.getBaseUrl(options.environment)
    this.apiKey = options.apiKey
    this.orgHost = options.orgHost
  }

  private getBaseUrl(env: string): string {
    switch (env) {
      case 'local':
        return 'http://localhost:8080'
      case 'dev':
        return 'https://dev.api.example.com'
      case 'stage':
        return 'https://stage.api.example.com'
      case 'prod':
        return 'https://api-wallet.weblock.land'
      default:
        throw new Error('Invalid environment')
    }
  }

  private async getHeaders(needsAccessToken = false): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Al-Api-Key': this.apiKey,
      'X-Al-Org-Host': this.orgHost,
    }

    if (needsAccessToken) {
      const accessToken = await LocalForage.get<string>(
        `${this.orgHost}:accessToken`
      )
      if (!accessToken) {
        throw new SDKError('No access token found', SDKErrorCode.AUTH_REQUIRED)
      }
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    return headers
  }

  private async request<T>(
    method: string,
    path: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<T> {
    const headers = await this.getHeaders(config.needsAccessToken)

    const requestInit: RequestInit = {
      method,
      headers: {
        ...headers,
        ...config.headers,
      },
      credentials: config.credentials,
    }

    if (data) {
      requestInit.body = JSON.stringify(data)
    }

    const response = await fetch(`${this.baseUrl}${path}`, requestInit)

    if (!response.ok) {
      throw new SDKError(
        `HTTP error! status: ${response.status}`,
        SDKErrorCode.REQUEST_FAILED,
        await response.json()
      )
    }

    if (
      response.status === 200 &&
      response.headers.get('content-length') === '0'
    ) {
      return undefined as T
    }

    try {
      return await response.json()
    } catch {
      return undefined as T
    }
  }

  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', path, undefined, config)
  }

  async post<T>(
    path: string,
    data: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>('POST', path, data, config)
  }

  async put<T>(
    path: string,
    data: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>('PUT', path, data, config)
  }

  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', path, undefined, config)
  }

  async patch<T>(
    path: string,
    data: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>('PATCH', path, data, config)
  }

  async options<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('OPTIONS', path, undefined, config)
  }

  getOrgHost(): string {
    return this.orgHost
  }
}
