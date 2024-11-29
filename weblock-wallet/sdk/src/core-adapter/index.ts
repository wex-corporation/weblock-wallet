import { Core, defaultConfig } from '@wefunding-dev/wallet-core'
import { AvailableProviders } from '@wefunding-dev/wallet-types'

export class CoreAdapter {
  private core: Core

  constructor(
    apiKey: string,
    env: keyof (typeof defaultConfig)['baseUrls'],
    orgHost?: string
  ) {
    this.core = new Core(env, apiKey, orgHost ?? 'http://default.org')
  }

  async signInWithProvider(providerId: AvailableProviders): Promise<void> {
    return this.core.signInWithProvider(providerId)
  }

  async signOut(): Promise<void> {
    return this.core.signOut()
  }

  async isLoggedIn(): Promise<boolean> {
    return this.core.isLoggedIn()
  }
}
