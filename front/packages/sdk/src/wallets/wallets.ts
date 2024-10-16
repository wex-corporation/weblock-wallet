// src/wallets/wallets.ts
import { Wallets as CoreWallets } from '@alwallet/core/src/module/wallets'
import { WalletServerHttpClient } from '@alwallet/core/src/utils/httpClient'
import { SDKError } from '../utils/errors' // Error handling

export class Wallets {
  private coreWallets: CoreWallets // Core Wallets 인스턴스
  private orgHost: string

  constructor(client: WalletServerHttpClient, orgHost: string) {
    this.coreWallets = new CoreWallets(client)
    this.orgHost = orgHost
  }

  async createWallet(userPassword: string): Promise<void> {
    try {
      console.log('🛠️ 지갑 생성 중...')
      await this.coreWallets.createWallet(userPassword)
    } catch (error) {
      console.error('지갑 생성 실패:', error)
      const err = error as Error // Error 타입 단언
      throw new SDKError(`지갑 생성 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  async retrieveWallet(userPassword?: string): Promise<void> {
    try {
      console.log('🔄 지갑 복구 중...')
      await this.coreWallets.retrieveWallet(userPassword)
    } catch (error) {
      console.error('지갑 복구 실패:', error)
      const err = error as Error
      throw new SDKError(`지갑 복구 중 오류가 발생했습니다: ${err.message}`)
    }
  }
}
