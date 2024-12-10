import axios, { AxiosInstance } from 'axios';
import { IHttpProvider, HttpConfig } from '../interfaces/http';
import { HttpError, NetworkError, TimeoutError } from '../../errors/http';

export class NodeHttpProvider implements IHttpProvider {
  private client: AxiosInstance;

  constructor(config: HttpConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
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

  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}
