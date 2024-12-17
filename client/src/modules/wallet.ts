import {
  SDKOptions,
  WalletInfo,
  NetworkInfo,
  SwitchNetworkResponse,
} from '../types'
import { InternalCore } from '../types/core'

export class WalletModule {
  constructor(
    private readonly options: SDKOptions,
    private readonly core: InternalCore
  ) {}

  async getInfo(): Promise<WalletInfo> {
    // 임시 구현
    return {} as WalletInfo
  }

  async switchNetwork(_networkId: string): Promise<SwitchNetworkResponse> {
    // 임시 구현
    return {} as SwitchNetworkResponse
  }

  async getNetworks(): Promise<NetworkInfo[]> {
    // 임시 구현
    return []
  }

  onWalletUpdate(_callback: (wallet: WalletInfo) => void): () => void {
    // 임시 구현
    return () => {}
  }

  onTransactionUpdate(
    _callback: (tx: WalletInfo['recentTransactions'][0]) => void
  ): () => void {
    // 임시 구현
    return () => {}
  }
}
