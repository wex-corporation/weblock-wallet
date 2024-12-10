import { Core, CoreOptions } from '@wallet-sdk/core';
import { BrowserHttpProvider } from './providers/browser/http';
import { BrowserStorageProvider } from './providers/browser/storage';
import { BrowserCryptoProvider } from './providers/browser/crypto';
import { SDKConfig } from './interfaces/config';
import { SDKInitializationError } from './errors';

export class WalletSDK {
  private core: Core | null = null;
  private initialized: boolean = false;

  public async initialize(config: SDKConfig): Promise<void> {
    if (this.initialized) {
      throw new Error('SDK is already initialized');
    }

    try {
      // 브라우저용 Provider 초기화
      const httpProvider = new BrowserHttpProvider({
        baseURL: config.baseURL,
        timeout: 30000,
      });
      const storageProvider = new BrowserStorageProvider();
      const cryptoProvider = new BrowserCryptoProvider();

      // Core 옵션 구성
      const coreOptions: CoreOptions = {
        apiKey: config.apiKey,
        env: config.env,
        orgHost: config.orgHost,
        providers: {
          http: httpProvider,
          storage: storageProvider,
          crypto: cryptoProvider,
        },
      };

      this.core = new Core(
        httpProvider,
        cryptoProvider,
        storageProvider,
        coreOptions
      );
      this.initialized = true;
    } catch (error) {
      throw new SDKInitializationError('Failed to initialize SDK', {
        cause: error as Error,
      });
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  // 최소한의 테스트를 위한 메서드
  public async getBlockchains(): Promise<any> {
    if (!this.initialized || !this.core) {
      throw new Error('SDK is not initialized');
    }
    return await this.core.getBlockchains();
  }
}
