import * as localforage from 'localforage'

const isBrowser = typeof window !== 'undefined'

export const LocalForage = {
  async save<T>(key: string, value: T, expiry?: number | null): Promise<void> {
    if (!isBrowser) {
      console.error('LocalForage is not available in this environment.')
      return
    }

    const item = { value, expiry }
    await localforage.setItem(key, item)
  },
  async get<T>(key: string): Promise<T | null> {
    if (!isBrowser) {
      console.error('LocalForage is not available in this environment.')
      return null
    }

    const item = await localforage.getItem<{
      value: T
      expiry?: number | null
    }>(key)
    if (!item) return null
    if (item.expiry && Date.now() > item.expiry * 1000) {
      await localforage.removeItem(key)
      return null
    }
    return item.value
  },
  async delete(key: string): Promise<void> {
    if (!isBrowser) {
      console.error('LocalForage is not available in this environment.')
      return
    }
    await localforage.removeItem(key)
  },
  async clear(): Promise<void> {
    if (!isBrowser) {
      console.error('LocalForage is not available in this environment.')
      return
    }
    await localforage.clear()
  }
}
