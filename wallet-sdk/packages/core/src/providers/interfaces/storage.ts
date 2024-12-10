export interface Item<T> {
  value: T;
  expiry?: number | null;
}

export interface IStorageProvider {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T, expiry?: number | null): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}
