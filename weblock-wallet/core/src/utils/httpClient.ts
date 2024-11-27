import { LocalForage } from './localForage'
import { ClientOptions, RequestConfig } from '@wefunding-dev/wallet-types'

export interface Client {
  request<T = any>(
    method: string,
    path: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T | null>

  get<T = any>(path: string, config?: RequestConfig): Promise<T | null>
  post<T = any>(
    path: string,
    data: any,
    config?: RequestConfig
  ): Promise<T | null>
  put<T = any>(
    path: string,
    data: any,
    config?: RequestConfig
  ): Promise<T | null>
  delete<T = any>(path: string, config?: RequestConfig): Promise<T | null>
  patch<T = any>(
    path: string,
    data: any,
    config?: RequestConfig
  ): Promise<T | null>
  options<T = any>(path: string, config?: RequestConfig): Promise<T | null>
  getOrgHost(): string
}

export class HttpClient {
  baseUrl: string
  protected customHeaders: HeadersInit

  constructor({ baseUrl, customHeaders = {} }: ClientOptions) {
    this.baseUrl = baseUrl
    this.customHeaders = customHeaders
  }

  async request<T = any>(
    method: string,
    path: string,
    data: any = null,
    config: RequestConfig = {}
  ): Promise<T | null> {
    const url = new URL(path, this.baseUrl)
    const headers = new Headers(config.headers)

    Object.entries(this.customHeaders).forEach(([key, value]) => {
      headers.set(key, value)
    })

    let body: string | null = null
    if (data) {
      body = JSON.stringify(data)
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
      credentials: config.credentials || 'same-origin'
    })

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} ${response.statusText}`
      )
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return response.json()
    }

    return null
  }

  get<T = any>(
    path: string,
    config: RequestConfig = { needsAccessToken: true }
  ): Promise<T | null> {
    return this.request('GET', path, null, config)
  }

  post<T = any>(
    path: string,
    data: any,
    config: RequestConfig = { needsAccessToken: true }
  ): Promise<T | null> {
    return this.request('POST', path, data, config)
  }

  put<T = any>(
    path: string,
    data: any,
    config: RequestConfig = { needsAccessToken: true }
  ): Promise<T | null> {
    return this.request('PUT', path, data, config)
  }

  delete<T = any>(
    path: string,
    config: RequestConfig = { needsAccessToken: true }
  ): Promise<T | null> {
    return this.request('DELETE', path, null, config)
  }

  patch<T = any>(
    path: string,
    data: any,
    config: RequestConfig = { needsAccessToken: true }
  ): Promise<T | null> {
    return this.request('PATCH', path, data, config)
  }

  options<T = any>(
    path: string,
    config: RequestConfig = { needsAccessToken: true }
  ): Promise<T | null> {
    return this.request('OPTIONS', path, null, config)
  }
}

export class WalletServerHttpClient extends HttpClient {
  apiKey: string
  orgHost: string

  constructor(options: ClientOptions, apiKey: string, orgHost: string) {
    super(options)
    this.apiKey = apiKey
    this.orgHost = orgHost
  }

  async request<T = any>(
    method: string,
    path: string,
    data: any = null,
    config: RequestConfig = {}
  ): Promise<T | null> {
    const headers = new Headers(this.customHeaders)
    headers.set('X-Al-Api-Key', this.apiKey)
    headers.set('X-Al-Org-Host', this.orgHost)

    if (config.needsAccessToken) {
      const accessToken = await LocalForage.get<string>(
        `${this.orgHost}:accessToken`
      )
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`)
      }
    }

    return super.request(method, path, data, {
      ...config,
      headers
    })
  }

  getOrgHost(): string {
    return this.orgHost
  }
}
