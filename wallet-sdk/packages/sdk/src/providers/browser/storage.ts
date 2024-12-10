import { IStorageProvider } from '@wallet-sdk/core';
import localforage from 'localforage';

export class BrowserStorageProvider implements IStorageProvider {
  private store: LocalForage;

  constructor() {
    this.store = localforage.createInstance({
      name: 'weblock-wallet',
      storeName: 'keystore',
    });
  }

  async setItem<T>(
    key: string,
    value: T,
    expiry?: number | null
  ): Promise<void> {
    const item = {
      value,
      expiry: expiry ? Math.floor(Date.now() / 1000) + expiry : null,
    };
    await this.store.setItem(key, item);
  }

  async getItem<T>(key: string): Promise<T | null> {
    const item = await this.store.getItem<{
      value: T;
      expiry: number | null;
    }>(key);

    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry * 1000) {
      await this.removeItem(key);
      return null;
    }

    return item.value;
  }

  async removeItem(key: string): Promise<void> {
    await this.store.removeItem(key);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }
}
