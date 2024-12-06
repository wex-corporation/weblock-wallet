import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { HttpError, NetworkError, TimeoutError } from '../errors/http';
import { SecureStorage } from './storage';

export class HttpClient {
  private readonly client: AxiosInstance;
  private readonly storage = SecureStorage.getInstance();

  constructor(config: {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
  }) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.setupErrorHandling();
    this.setupAuthInterceptor();
  }

  private setupErrorHandling() {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (!error.response) {
          throw new NetworkError('Network error occurred');
        }
        if (error.code === 'ECONNABORTED') {
          throw new TimeoutError();
        }
        throw new HttpError(
          error.response.status,
          error.response.statusText,
          error.response.data
        );
      }
    );
  }

  private setupAuthInterceptor() {
    this.client.interceptors.request.use(async (config) => {
      const token = await this.storage.getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && error instanceof NetworkError) {
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }
}
