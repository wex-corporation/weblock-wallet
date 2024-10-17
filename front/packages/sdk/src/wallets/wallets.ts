import { Wallets as CoreWallets } from '@alwallet/core/src/module/wallets'
import { WalletServerHttpClient } from '@alwallet/core/src/utils/httpClient'
import { SDKError } from '../utils/errors' // Error handling
import { Wallet } from 'ethers'
import { Coin } from '@alwallet/core'

export class Wallets {
  private coreWallets: CoreWallets // CoreWallets 인스턴스 사용

  constructor(client: WalletServerHttpClient) {
    this.coreWallets = new CoreWallets(client)
  }

  /**
   * 지갑 생성
   * @param password 사용자 비밀번호
   */
  public async createWallet(password: string): Promise<void> {
    try {
      await this.coreWallets.createWallet(password)
    } catch (error) {
      const err = error as Error
      throw new SDKError(`지갑 생성 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  /**
   * 지갑 복구
   * @param password 사용자 비밀번호
   */
  public async retrieveWallet(password: string): Promise<void> {
    try {
      await this.coreWallets.retrieveWallet(password)
    } catch (error) {
      const err = error as Error
      throw new SDKError(`지갑 복구 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  /**
   * 잔액 조회
   * @param chainId 블록체인 ID
   */
  public async getBalance(chainId: number): Promise<string> {
    try {
      const walletAddress = this.getWalletAddress()
      if (!walletAddress) {
        throw new SDKError('지갑을 먼저 생성하거나 복구하세요.')
      }
      return await this.coreWallets.getBalance(chainId)
    } catch (error) {
      const err = error as Error
      throw new SDKError(`잔액 조회 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  /**
   * 지갑 주소 반환
   */
  public getWalletAddress(): string | null {
    return this.coreWallets.wallet?.address || null
  }

  /**
   * 전체 지갑 객체 반환
   */
  public getWallet(): Wallet | null {
    return this.coreWallets.wallet || null
  }

  public async sendTransaction(
    nodeUrl: string,
    chainId: number,
    amount: string,
    to: string,
    coin: Coin,
    nonce?: number,
    gasLimit?: bigint,
    gasPrice?: string
  ): Promise<string> {
    try {
      return await this.coreWallets.sendTransction(
        nodeUrl,
        chainId,
        amount,
        to,
        coin,
        nonce,
        gasLimit,
        gasPrice
      )
    } catch (error) {
      const err = error as Error
      throw new SDKError(`트랜잭션 처리 중 오류가 발생했습니다: ${err.message}`)
    }
  }
}
