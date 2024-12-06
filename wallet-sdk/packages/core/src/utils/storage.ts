import localforage from 'localforage';

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

  async setToken(token: string): Promise<void> {
    await this.storage.setItem('auth_token', token);
  }

  async getToken(): Promise<string | null> {
    return await this.storage.getItem('auth_token');
  }

  async removeToken(): Promise<void> {
    await this.storage.removeItem('auth_token');
  }

  // 추후 키 관리를 위한 메서드들 추가 가능
  // async setEncryptedKey(key: string): Promise<void>
  // async getEncryptedKey(): Promise<string | null>
}
