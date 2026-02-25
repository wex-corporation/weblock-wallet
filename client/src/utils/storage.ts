import localforage from 'localforage'

interface Item<T> {
  value: T
  /**
   * Absolute expiry time in epoch milliseconds.
   * If omitted, the value does not expire.
   */
  expiryEpochMs?: number | null
}

interface ILocalForage {
  save<T>(key: string, value: T, expiryEpochMs?: number | null): Promise<void>
  get<T>(key: string): Promise<T | null>
  delete(key: string): Promise<void>
  removeAll(): Promise<void>
}

const toExpiryEpochMs = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null
  }
  // Legacy compatibility: older clients may store expiry in epoch seconds.
  return value < 1_000_000_000_000 ? value * 1000 : value
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isWrappedItem = <T>(value: unknown): value is Item<T> & { expiry?: number } =>
  isObjectRecord(value) &&
  'value' in value &&
  ('expiryEpochMs' in value || 'expiry' in value || Object.keys(value).length === 1)

// LocalForage instance
const storage = localforage.createInstance({
  name: '@WeBlock-wallet',
  storeName: 'secure-storage',
  driver: localforage.INDEXEDDB,
  description: 'WeBlock Wallet SDK Secure Storage',
})

export const LocalForage: ILocalForage = {
  async save<T>(
    key: string,
    value: T,
    expiryEpochMs?: number | null
  ): Promise<void> {
    try {
      const item: Item<T> = {
        value,
        expiryEpochMs,
      }
      await storage.setItem(key, item)
    } catch (err) {
      console.error(`Error saving data for key "${key}":`, err)
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await storage.getItem<unknown>(key)

      if (!item) return null

      if (isWrappedItem<T>(item)) {
        const expiryEpochMs = toExpiryEpochMs(item.expiryEpochMs ?? item.expiry)
        if (expiryEpochMs && Date.now() > expiryEpochMs) {
          await storage.removeItem(key)
          return null
        }
        return item.value ?? null
      }

      // Legacy compatibility: some old entries were stored as a raw value.
      return item as T
    } catch (err) {
      console.error(`Error retrieving data for key "${key}":`, err)
      return null
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await storage.removeItem(key)
    } catch (err) {
      console.error(`Error deleting data for key "${key}":`, err)
    }
  },

  async removeAll(): Promise<void> {
    try {
      await storage.clear()
    } catch (err) {
      console.error('Error removing all data:', err)
    }
  },
}
