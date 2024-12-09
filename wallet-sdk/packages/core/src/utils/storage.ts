import localforage from 'localforage';
import { StorageError } from '../errors';

interface Item<T> {
  value: T;
  expiry?: number | null;
}

export class SecureStorage {
  private static instance: SecureStorage;
  private storage: LocalForage;

  private constructor() {
    this.storage = localforage.createInstance({
      name: 'weblock-wallet',
      storeName: 'secure_storage',
    });
  }

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * 데이터 저장
   * @param key 저장할 키
   * @param value 저장할 값
   * @param expiry 만료 시간 (초 단위, null이면 만료되지 않음)
   */
  async set<T>(key: string, value: T, expiry?: number | null): Promise<void> {
    try {
      const item: Item<T> = {
        value,
        expiry,
      };
      await this.storage.setItem(key, item);
    } catch (error) {
      throw new StorageError(`Failed to save data for key "${key}"`, {
        cause: error as Error,
      });
    }
  }

  /**
   * 데이터 조회
   * @param key 조회할 키
   * @returns 저장된 값 또는 null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await this.storage.getItem<Item<T>>(key);

      if (!item) {
        return null;
      }

      if (item.expiry && Date.now() > item.expiry * 1000) {
        await this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      throw new StorageError(`Failed to retrieve data for key "${key}"`, {
        cause: error as Error,
      });
    }
  }

  /**
   * 데이터 삭제
   * @param key 삭제할 키
   */
  async remove(key: string): Promise<void> {
    try {
      await this.storage.removeItem(key);
    } catch (error) {
      throw new StorageError(`Failed to delete data for key "${key}"`, {
        cause: error as Error,
      });
    }
  }

  /**
   * 모든 데이터 삭제
   */
  async clear(): Promise<void> {
    try {
      await this.storage.clear();
    } catch (error) {
      throw new StorageError('Failed to clear all data', {
        cause: error as Error,
      });
    }
  }
}
