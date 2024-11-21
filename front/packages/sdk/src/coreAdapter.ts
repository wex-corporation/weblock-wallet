import { Core } from '@weblock-wallet/core'
import { AppConfig, SendTransaction } from '@weblock-wallet/types'

export interface CoreConfig {
  env: keyof AppConfig['baseUrls']
  apiKey: string
  orgHost: string
}

class CoreAdapter {
  private coreInstance: Core

  constructor(config: CoreConfig) {
    this.coreInstance = new Core(config.env, config.apiKey, config.orgHost)
  }

  async signInWithGoogle(): Promise<void> {
    return await this.coreInstance.signInWithGoogle()
  }

  async signOut(): Promise<void> {
    return await this.coreInstance.signOut()
  }

  async getBalance(chainId: number): Promise<string> {
    return await this.coreInstance.getBalance(chainId)
  }

  async sendTransaction(chainId: number, transaction: SendTransaction) {
    return await this.coreInstance.sendTransaction(chainId, transaction)
  }

  // 여기서 Core의 모든 메서드를 래핑하지 않고, 중요한 메서드들만 노출합니다.
}

export default CoreAdapter
