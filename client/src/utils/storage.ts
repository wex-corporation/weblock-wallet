import localforage from 'localforage'

interface Item<T> {
  value: T
  expiry?: number | null
}

interface ILocalForage {
  save<T>(key: string, value: T, expiry?: number | null): Promise<void>
  get<T>(key: string): Promise<T | null>
  delete(key: string): Promise<void>
  removeAll(): Promise<void>
}

// LocalForage 인스턴스 생성
const storage = localforage.createInstance({
  name: '@WeBlock-wallet',
  storeName: 'secure-storage',
  driver: localforage.INDEXEDDB,
  description: 'WeBlock Wallet SDK Secure Storage',
})

export const LocalForage: ILocalForage = {
  async save<T>(key: string, value: T, expiry?: number | null): Promise<void> {
    try {
      const item: Item<T> = {
        value,
        expiry,
      }
      await storage.setItem(key, item)
    } catch (err) {
      console.error(`Error saving data for key "${key}":`, err)
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await storage.getItem<Item<T>>(key)

      if (!item) {
        return null
      }

      if (item.expiry && Date.now() > item.expiry * 1000) {
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
