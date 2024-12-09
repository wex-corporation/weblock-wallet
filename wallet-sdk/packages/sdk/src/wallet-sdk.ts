import { SDKConfig } from './interfaces/config';
import { Core, CoreOptions } from '@wallet-sdk/core';

export class WalletSDK {
  private core: Core | null = null;
  private initialized: boolean = false;

  constructor() {
    // 생성자에서는 최소한의 초기화만 수행
  }

  /**
   * Initialize the SDK with configuration
   * @param config SDK configuration
   * @throws {SDKInitializationError}
   */
  public async initialize(config: SDKConfig): Promise<void> {
    if (this.initialized) {
      throw new Error('SDK is already initialized');
    }

    try {
      const options: CoreOptions = {
        env: config.env,
        apiKey: config.apiKey,
        orgHost: config.orgHost,
      };

      this.core = new Core(options);
      this.initialized = true;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check if SDK is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  private handleError(error: unknown): Error {
    // 에러 처리 로직
    return error as Error;
  }
}
