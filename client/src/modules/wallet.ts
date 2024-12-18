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
