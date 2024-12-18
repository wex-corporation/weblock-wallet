import {
  SDKOptions,
  WalletInfo,
  NetworkInfo,
  SwitchNetworkResponse,
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

  async switchNetwork(networkId: string): Promise<SwitchNetworkResponse> {
    const { network } = await this.core.network.switch(networkId)
    const assets = await this.core.wallet.getInfo().then((info) => info.assets)
    return { network, assets }
  }

  async getNetworks(): Promise<NetworkInfo[]> {
    return this.core.network.getNetworks()
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
