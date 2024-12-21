import {
  SDKOptions,
  WalletInfo,
  SDKError,
  SDKErrorCode,
  TokenBalance,
} from '../types'
import { InternalCore } from '../core/types'

export class WalletModule {
  constructor(
    private readonly options: SDKOptions,
    private readonly core: InternalCore
  ) {}

  async getInfo(): Promise<WalletInfo> {
    try {
      // 1. 로그인 상태 확인
      console.log('1. 로그인 상태 확인 시작')
      const isLoggedIn = await this.core.auth.isLoggedIn()
      console.log('로그인 상태:', isLoggedIn)

      if (!isLoggedIn) {
        throw new SDKError('로그인이 필요합니다', SDKErrorCode.NOT_LOGGED_IN)
      }

      // 2. 지갑 주소 조회
      console.log('2. 지갑 주소 조회 시작')
      const address = await this.core.wallet.getAddress()
      console.log('지갑 주소:', address)

      if (!address) {
        throw new SDKError(
          '지갑 주소를 찾을 수 없습니다',
          SDKErrorCode.WALLET_NOT_FOUND
        )
      }

      // 3. 네트워크 정보 조회
      console.log('3. 네트워크 정보 조회 시작')
      const [currentNetwork, availableNetworks] = await Promise.all([
        this.core.network.getCurrentNetwork(),
        this.core.network.getRegisteredNetworks(),
      ])
      console.log('현재 네트워크:', currentNetwork)
      console.log('사용 가능한 네트워크:', availableNetworks)

      // 현재 네트워크가 없으면 기본 네트워크로 설정
      if (!currentNetwork) {
        const defaultNetwork =
          availableNetworks.find((n) => !n.isTestnet) || availableNetworks[0]
        await this.core.network.switchNetwork(defaultNetwork.id)
        console.log('기본 네트워크로 설정:', defaultNetwork.name)
      }

      const network = await this.core.network.getCurrentNetwork()
      if (!network) {
        throw new SDKError(
          '네트워크 전환 실패',
          SDKErrorCode.NETWORK_SWITCH_FAILED
        )
      }

      // 4. 네이티브 토큰 잔액 조회
      console.log('4. 잔액 조회 시작')
      const nativeBalance = await this.core.wallet.getBalance(
        address,
        network.chainId
      )
      console.log('네이티브 토큰 잔액:', nativeBalance)

      // 5. 최근 트랜잭션 조회
      console.log('5. 최근 트랜잭션 조회 시작')
      const latestTransaction = await this.core.wallet.getLatestTransaction(
        address,
        network.chainId
      )
      console.log('최근 트랜잭션:', latestTransaction)

      const walletInfo: WalletInfo = {
        address,
        network: {
          current: network,
          available: availableNetworks,
        },
        assets: {
          native: {
            symbol: network.symbol,
            balance: nativeBalance,
            decimals: 18,
          },
          tokens: [],
          nfts: [],
          securities: [],
        },
        latestTransaction,
      }

      console.log('6. 최종 지갑 정보:', walletInfo)
      return walletInfo
    } catch (error) {
      console.error('지갑 정보 조회 중 에러 발생:', error)
      throw new SDKError(
        '지갑 정보 조회 실패',
        SDKErrorCode.WALLET_RETRIEVAL_FAILED,
        error
      )
    }
  }
  async getBalance(address: string, chainId: number): Promise<TokenBalance> {
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

  onWalletUpdate(_callback: (wallet: WalletInfo) => void): () => void {
    // 임시 구현: 나중에 이벤트 리스너 추가
    return () => {}
  }

  onTransactionUpdate(
    _callback: (tx: WalletInfo['latestTransaction']) => void
  ): () => void {
    // 임시 구현: 나중에 이벤트 리스너 추가
    return () => {}
  }
}
