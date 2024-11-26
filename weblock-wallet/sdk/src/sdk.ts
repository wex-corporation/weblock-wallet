import { Logger } from './utils/logger'

export class WalletSDK {
  private initialized = false

  /**
   * Initialize the SDK with configuration.
   * @param config - Configuration object containing API key and environment info.
   */
  initialize(config: {
    apiKey: string
    env: 'local' | 'staging' | 'production'
    orgHost?: string
  }): void {
    if (this.initialized) {
      throw new Error('SDK is already initialized.')
    }

    Logger.log('Initializing SDK with config:', config)
    // TODO: CoreAdapter를 사용해 Core와 연결

    this.initialized = true
  }

  /**
   * Check if the SDK is initialized.
   * @returns true if initialized, false otherwise.
   */
  isInitialized(): boolean {
    return this.initialized
  }
}
