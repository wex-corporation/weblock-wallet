import { Core, SendTransaction } from '@alwallet/core' // Core 패키지의 기능 사용
import { Wallet } from 'ethers'

export class WalletManager {
  private core: Core

  constructor(env: string, apiKey: string, orgHost: string) {
    this.core = new Core(env, apiKey, orgHost) // Core 인스턴스 생성
  }

  // 지갑 생성
  async createWallet(password: string): Promise<Wallet | null> {
    await this.core.retrieveWallet(password)
    return this.core.getWallet()
  }

  // 잔액 조회
  async getBalance(chainId: number): Promise<string> {
    return await this.core.getBalance(chainId)
  }

  // 트랜잭션 전송
  async sendTransaction(
    chainId: number,
    transaction: SendTransaction
  ): Promise<string> {
    return await this.core.sendTransaction(chainId, transaction)
  }

  // 지갑 주소 조회
  getWalletAddress(): string | null {
    const wallet = this.core.getWallet()
    return wallet ? wallet.address : null
  }

  // 지갑 복구
  async retrieveWallet(userPassword: string): Promise<void> {
    await this.core.retrieveWallet(userPassword)
  }
}
