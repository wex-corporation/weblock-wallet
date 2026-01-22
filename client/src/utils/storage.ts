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
      const item = await storage.getItem<Item<T>>(key)

      if (!item) return null

      // Fix: expiry is epoch ms, compare directly.
      if (item.expiryEpochMs && Date.now() > item.expiryEpochMs) {
        await storage.removeItem(key)
        return null
      }

      return item.value
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
