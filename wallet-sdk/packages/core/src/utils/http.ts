import { IHttpProvider } from '../providers/interfaces/http';
import { SecureStorage } from './storage';

export class HttpClient {
  private readonly provider: IHttpProvider;
  private readonly storage = SecureStorage.getInstance();

  constructor(provider: IHttpProvider) {
    this.provider = provider;
    this.setupAuthInterceptor();
  }

  private async setupAuthInterceptor() {
    const token = await this.storage.getToken();
    if (token) {
      this.provider.setAuthToken(token);
    }
  }

  async get<T>(url: string, config?: any): Promise<T> {
    return this.provider.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.provider.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.provider.put<T>(url, data, config);
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    return this.provider.delete<T>(url, config);
  }
}
