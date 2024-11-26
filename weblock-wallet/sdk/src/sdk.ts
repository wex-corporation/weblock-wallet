import { Logger } from './utils/logger'
import { CoreAdapter } from './core-adapter'
import { WalletSDKConfig } from './types/sdk-types'

export class WalletSDK {
  private initialized = false
  private coreAdapter: CoreAdapter | null = null

  /**
   * Initialize the SDK with the necessary configuration.
   * @param config - Configuration object containing API key, environment, and optional organization host.
   * @throws Error if the SDK is already initialized.
   */
  initialize(config: WalletSDKConfig): void {
    if (this.initialized) {
      throw new Error('SDK is already initialized.')
    }

    Logger.log('Initializing SDK with config:', config)

    this.coreAdapter = new CoreAdapter(
      config.apiKey,
      config.env,
      config.orgHost
    )

    this.initialized = true
    Logger.log('SDK initialized successfully.')
  }

  /**
   * Check if the SDK has been initialized.
   * @returns boolean - True if the SDK is initialized, false otherwise.
   */
  isInitialized(): boolean {
    return this.initialized
  }
}
