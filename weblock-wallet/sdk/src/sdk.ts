import { Logger } from './utils/logger'
import { CoreAdapter } from './core-adapter'
import { WalletSDKConfig } from './types/sdk-types'
import { AvailableProviders } from '@wefunding-dev/wallet-types'

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
      config.env, // 이제 env 타입이 정확히 정의됨
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

  /**
   * Sign in with a specified provider.
   * @param providerId - The ID of the OAuth provider.
   */
  async signInWithProvider(providerId: AvailableProviders): Promise<void> {
    if (!this.coreAdapter) throw new Error('SDK not initialized.')
    return this.coreAdapter.signInWithProvider(providerId)
  }

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<void> {
    if (!this.coreAdapter) throw new Error('SDK not initialized.')
    return this.coreAdapter.signOut()
  }

  /**
   * Check if the user is currently logged in.
   * @returns boolean - True if logged in, false otherwise.
   */
  async isLoggedIn(): Promise<boolean> {
    if (!this.coreAdapter) throw new Error('SDK not initialized.')
    return this.coreAdapter.isLoggedIn()
  }
}
