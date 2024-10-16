// sdk/src/wallets/wallets.ts
import { Wallets as CoreWallets } from '@alwallet/core/src/module/wallets'
import { Client } from '@alwallet/core/src/utils/httpClient'

export class Wallets {
  private coreWallets: CoreWallets

  constructor(client: Client) {
    this.coreWallets = new CoreWallets(client)
  }

  // 사용자 비밀번호로 지갑 생성
  async createWallet(userPassword: string): Promise<void> {
    console.log('Creating wallet...')
    await this.coreWallets.createWallet(userPassword)
  }

  // 지갑 복구
  async retrieveWallet(userPassword?: string): Promise<void> {
    console.log('Retrieving wallet...')
    await this.coreWallets.retrieveWallet(userPassword)
  }

  // 지갑 주소 가져오기
  getWalletAddress(): string | null {
    const wallet = this.coreWallets.wallet
    return wallet ? wallet.address : null
  }

  // 잔액 조회
  async getBalance(chainId: number): Promise<string> {
    console.log('Fetching balance...')
    return await this.coreWallets.getBalance(chainId)
  }
}
