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

export const LocalForage: ILocalForage = {
  async save<T>(key: string, value: T, expiry?: number | null): Promise<void> {
    try {
      const item: Item<T> = {
        value,
        expiry
      }
      await localforage.setItem(key, item)
    } catch (err) {
      console.error(`Error saving data for key "${key}":`, err)
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await localforage.getItem<Item<T>>(key)

      if (!item) {
        return null
      }

      if (item.expiry && Date.now() > item.expiry * 1000) {
        await localforage.removeItem(key)
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
      await localforage.removeItem(key)
    } catch (err) {
      console.error(`Error deleting data for key "${key}":`, err)
    }
  },

  async removeAll(): Promise<void> {
    try {
      await localforage.clear()
    } catch (err) {
      console.error('Error removing all data:', err)
    }
  }
}

export default LocalForage
