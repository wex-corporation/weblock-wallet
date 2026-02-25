// src/clients/http.ts

import { SDKError, SDKOptions, SDKErrorCode } from '@/types'
import { LocalForage } from '@/utils/storage'
import { Jwt } from '@/utils/jwt'

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
        return 'https://api-wallet.weblock.land'
      case 'stage':
        return 'https://stage.api.example.com'
      case 'prod':
        return 'https://api-wallet.weblock.land'
      default:
        throw new Error('Invalid environment')
    }
  }

  private getAccessTokenStorageKey(): string {
    return `${this.orgHost}:accessToken`
  }

  private async getValidAccessToken(): Promise<string> {
    const tokenKey = this.getAccessTokenStorageKey()
    const accessToken = await LocalForage.get<string>(tokenKey)
    if (!accessToken) {
      throw new SDKError(
        'Session expired. Please sign in again.',
        SDKErrorCode.AUTH_REQUIRED
      )
    }

    const payload = Jwt.tryParse(accessToken)
    const expiryEpochMs =
      typeof payload?.exp === 'number' && Number.isFinite(payload.exp)
        ? payload.exp * 1000
        : null

    if (!expiryEpochMs || Date.now() >= expiryEpochMs) {
      await LocalForage.delete(tokenKey)
      throw new SDKError(
        'Session expired. Please sign in again.',
        SDKErrorCode.AUTH_REQUIRED,
        { reason: 'access_token_expired' }
      )
    }

    return accessToken
  }

  private async getHeaders(needsAccessToken = false): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Al-Api-Key': this.apiKey,
      'X-Al-Org-Host': this.orgHost,
    }

    if (needsAccessToken) {
      const accessToken = await this.getValidAccessToken()
      ;(headers as Record<string, string>)['Authorization'] =
        `Bearer ${accessToken}`
    }

    return headers
  }

  private async safeReadErrorDetails(
    response: Response
  ): Promise<unknown | undefined> {
    const contentType = response.headers.get('content-type') || ''

    try {
      if (contentType.includes('application/json')) {
        return await response.json()
      }
    } catch {
      // ignore and try text
    }

    try {
      const text = await response.text()
      return text || undefined
    } catch {
      return undefined
    }
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
        ...(headers as Record<string, string>),
        ...(config.headers as Record<string, string> | undefined),
      },
      credentials: config.credentials,
    }

    if (data !== undefined) {
      requestInit.body = JSON.stringify(data)
    }

    const response = await fetch(`${this.baseUrl}${path}`, requestInit)

    if (!response.ok) {
      // If an authenticated request fails due to auth, clear token to force re-authentication.
      if (
        config.needsAccessToken &&
        (response.status === 401 || response.status === 403)
      ) {
        await LocalForage.delete(this.getAccessTokenStorageKey())
        throw new SDKError(
          'Session expired. Please sign in again.',
          SDKErrorCode.AUTH_REQUIRED,
          await this.safeReadErrorDetails(response)
        )
      }

      throw new SDKError(
        `HTTP error! status: ${response.status}`,
        SDKErrorCode.REQUEST_FAILED,
        await this.safeReadErrorDetails(response)
      )
    }

    // No content
    if (response.status === 204) return undefined as T

    const contentLength = response.headers.get('content-length')
    if (contentLength === '0') return undefined as T

    try {
      return (await response.json()) as T
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
