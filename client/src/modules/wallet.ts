import {
  SDKOptions,
  WalletInfo,
  NetworkInfo,
  SwitchNetworkResponse,
  WalletResponse,
} from '../types'
import { InternalCore } from '../core/types'

export class WalletModule {
  constructor(
    private readonly options: SDKOptions,
    private readonly core: InternalCore
  ) {}

  async getInfo(): Promise<WalletInfo> {
    return this.core.wallet.getInfo()
  }
  async getBalance(address: string, chainId: number): Promise<string> {
    return this.core.wallet.getBalance(address, chainId)
  }

  async getTransactionCount(address: string, chainId: number): Promise<number> {
    return this.core.wallet.getTransactionCount(address, chainId)
  }

  async getBlockNumber(chainId: number): Promise<number> {
    return this.core.wallet.getBlockNumber(chainId)
  }

  async sendRawTransaction(signedTx: string, chainId: number): Promise<string> {
    return this.core.wallet.sendRawTransaction(signedTx, chainId)
  }

  async getTransactionReceipt(txHash: string, chainId: number): Promise<any> {
    return this.core.wallet.getTransactionReceipt(txHash, chainId)
  }

  async getTransaction(txHash: string, chainId: number): Promise<any> {
    return this.core.wallet.getTransaction(txHash, chainId)
  }

  async estimateGas(txParams: any, chainId: number): Promise<number> {
    return this.core.wallet.estimateGas(txParams, chainId)
  }

  async getGasPrice(chainId: number): Promise<string> {
    return this.core.wallet.getGasPrice(chainId)
  }

  async call(
    txParams: any,
    blockParam: string | number,
    chainId: number
  ): Promise<string> {
    return this.core.wallet.call(txParams, blockParam, chainId)
  }

  onWalletUpdate(callback: (wallet: WalletInfo) => void): () => void {
    // 임시 구현: 나중에 이벤트 리스너 추가
    return () => {}
  }

  onTransactionUpdate(
    callback: (tx: WalletInfo['recentTransactions'][0]) => void
  ): () => void {
    // 임시 구현: 나중에 이벤트 리스너 추가
    return () => {}
  }
}
