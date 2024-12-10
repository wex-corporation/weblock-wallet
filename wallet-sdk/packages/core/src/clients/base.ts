import { HttpClient } from '../utils/http';
import { SecureStorage } from '../utils/storage';
import { IHttpProvider } from '../providers/interfaces/http';
import {
  ApiResponse,
  ClientOptions,
  RequestConfig,
  ApiError,
  ApiErrorCode,
} from '../types/client';
import { HttpError, NetworkError, TimeoutError } from '../errors/http';

export abstract class BaseApiClient {
  protected readonly http: HttpClient;
  protected readonly storage: SecureStorage;
  protected readonly apiKey: string;
  protected readonly orgHost: string;
  protected readonly options: ClientOptions;

  constructor(options: ClientOptions, httpProvider: IHttpProvider) {
    this.options = options;
    this.storage = SecureStorage.getInstance();
    this.apiKey = options.apiKey;
    this.orgHost = options.orgHost;

    // Provider를 HttpClient에 주입
    this.http = new HttpClient(httpProvider);
  }

  /**
   * API 요청에 공통 헤더 추가
   */
  protected async getHeaders(
    config?: RequestConfig
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Al-Api-Key': this.apiKey,
      'X-Al-Org-Host': this.orgHost,
      ...config?.headers,
    };

    if (config?.needsAccessToken !== false) {
      const token = await this.storage.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * API 응답 처리 및 에러 변환
   */
  protected handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      this.handleError(response.error);
    }
    return response.data as T;
  }

  /**
   * API 에러 처리
   */
  protected handleError(error?: ApiError): never {
    if (!error) {
      throw new HttpError(500, 'Unknown error occurred');
    }

    switch (error.code) {
      case ApiErrorCode.UNAUTHORIZED:
        throw new HttpError(401, error.message);
      case ApiErrorCode.FORBIDDEN:
        throw new HttpError(403, error.message);
      case ApiErrorCode.NOT_FOUND:
        throw new HttpError(404, error.message);
      case ApiErrorCode.NETWORK_ERROR:
        throw new NetworkError(error.message);
      case ApiErrorCode.TIMEOUT_ERROR:
        throw new TimeoutError();
      default:
        throw new HttpError(500, error.message);
    }
  }

  /**
   * API 경로 생성
   */
  protected buildPath(path: string): string {
    return path.startsWith('/') ? path : `/${path}`;
  }

  /**
   * GET 요청 래퍼
   */
  protected async get<T>(path: string, config?: RequestConfig): Promise<T> {
    const headers = await this.getHeaders(config);
    const response = await this.http.get<ApiResponse<T>>(this.buildPath(path), {
      ...config,
      headers,
    });
    return this.handleResponse(response);
  }

  /**
   * POST 요청 래퍼
   */
  protected async post<T>(
    path: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const headers = await this.getHeaders(config);
    const response = await this.http.post<ApiResponse<T>>(
      this.buildPath(path),
      data,
      { ...config, headers }
    );
    return this.handleResponse(response);
  }

  /**
   * 토큰 관리
   */
  protected async setToken(token: string): Promise<void> {
    await this.storage.setToken(token);
  }

  protected async clearToken(): Promise<void> {
    await this.storage.removeToken();
  }
}
