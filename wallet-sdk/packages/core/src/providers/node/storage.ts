import { IStorageProvider, Item } from '../interfaces/storage';

export class NodeStorageProvider implements IStorageProvider {
  private storage: Map<string, Item<any>> = new Map();

  async getItem<T>(key: string): Promise<T | null> {
    const item = this.storage.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry * 1000) {
      await this.removeItem(key);
      return null;
    }
    return item.value;
  }

  async setItem<T>(
    key: string,
    value: T,
    expiry?: number | null
  ): Promise<void> {
    this.storage.set(key, { value, expiry });
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}
