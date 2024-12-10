import { IStorageProvider } from '../providers/interfaces/storage';
import { NodeStorageProvider } from '../providers/node/storage';
import { StorageError } from '../errors';

export class SecureStorage {
  private static instance: SecureStorage;
  private provider: IStorageProvider;

  private constructor() {
    this.provider = new NodeStorageProvider();
  }

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  async set<T>(key: string, value: T, expiry?: number | null): Promise<void> {
    try {
      await this.provider.setItem(key, value, expiry);
    } catch (error) {
      throw new StorageError(`Failed to save data for key "${key}"`, {
        cause: error as Error,
      });
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.provider.getItem<T>(key);
    } catch (error) {
      throw new StorageError(`Failed to retrieve data for key "${key}"`, {
        cause: error as Error,
      });
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this.provider.removeItem(key);
    } catch (error) {
      throw new StorageError(`Failed to delete data for key "${key}"`, {
        cause: error as Error,
      });
    }
  }

  async clear(): Promise<void> {
    try {
      await this.provider.clear();
    } catch (error) {
      throw new StorageError('Failed to clear all data', {
        cause: error as Error,
      });
    }
  }

  async getToken(): Promise<string | null> {
    return await this.get<string>('token');
  }

  async setToken(token: string): Promise<void> {
    await this.set('token', token);
  }

  async removeToken(): Promise<void> {
    await this.remove('token');
  }
}
