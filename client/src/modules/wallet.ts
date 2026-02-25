import {
  SDKOptions,
  WalletInfo,
  SDKError,
  SDKErrorCode,
  TokenBalance,
  TokenInfo,
} from '../types'
import { InternalCore } from '../core/types'
import { WEBLOCK_FUJI_DEPLOYMENT } from '../core/config/weblockFujiDeployment'
import { TokenAmount } from '../utils/numbers'

type RegisteredCoin = {
  id: string
  blockchainId: string
  name: string
  symbol: string
  contractAddress: string
  decimals: number
}

const FUJI_CHAIN_ID = WEBLOCK_FUJI_DEPLOYMENT.chainId
const FUJI_USDR_ADDRESS = WEBLOCK_FUJI_DEPLOYMENT.tokens.USDR.address.toLowerCase()
const FUJI_RBT_ADDRESS =
  WEBLOCK_FUJI_DEPLOYMENT.contracts.product1.rbtAsset.toLowerCase()
const FUJI_RBT_SERIES_ID = Number(
  WEBLOCK_FUJI_DEPLOYMENT.contracts.product1.seriesId
)

export class WalletModule {
  constructor(
    private readonly options: SDKOptions,
    private readonly core: InternalCore
  ) {}

  private pickDefaultNetwork(availableNetworks: WalletInfo['network']['available']) {
    if (!availableNetworks.length) return null

    const fuji =
      availableNetworks.find(
        (network) =>
          network.chainId === FUJI_CHAIN_ID &&
          (network.isTestnet ||
            (network.name || '').toLowerCase().includes('fuji') ||
            (network.rpcUrl || '').toLowerCase().includes('avax-test'))
      ) ?? null

    if (fuji) return fuji

    return availableNetworks.find((network) => !network.isTestnet) ?? availableNetworks[0]
  }

  private withDefaultRegisteredCoins(
    network: WalletInfo['network']['current'],
    registered: RegisteredCoin[]
  ): RegisteredCoin[] {
    if (!network) return registered

    const map = new Map<string, RegisteredCoin>()
    for (const coin of registered) {
      if (!coin?.contractAddress) continue
      map.set(coin.contractAddress.toLowerCase(), {
        ...coin,
        contractAddress: coin.contractAddress.toLowerCase(),
      })
    }

    if (network.chainId === FUJI_CHAIN_ID && !map.has(FUJI_USDR_ADDRESS)) {
      map.set(FUJI_USDR_ADDRESS, {
        id: 'default-fuji-usdr',
        blockchainId: network.id,
        name: 'WeBlock USD Settlement Token',
        symbol: 'USDR',
        contractAddress: FUJI_USDR_ADDRESS,
        decimals: 18,
      })
    }

    return Array.from(map.values())
  }

  private decodeHexBalanceToDecimal(value: string): string {
    if (!value) return '0'
    try {
      return BigInt(value).toString()
    } catch {
      return '0'
    }
  }

  private async getFujiRbtTokenInfo(
    networkId: string,
    walletAddress: string
  ): Promise<TokenInfo | null> {
    try {
      const rawHex = await this.core.asset.getERC1155Balance({
        networkId,
        tokenAddress: FUJI_RBT_ADDRESS,
        walletAddress,
        tokenId: FUJI_RBT_SERIES_ID,
      })

      const raw = this.decodeHexBalanceToDecimal(rawHex)
      const balance: TokenBalance = {
        raw,
        formatted: TokenAmount.fromWei(raw, 0),
        decimals: 0,
        symbol: 'RBT',
      }

      return {
        address: FUJI_RBT_ADDRESS,
        name: 'RBT Property Token',
        symbol: 'RBT',
        decimals: 0,
        balance,
        totalSupply: {
          raw: '0',
          formatted: '0',
          decimals: 0,
          symbol: 'RBT',
        },
      }
    } catch (error) {
      console.warn('Failed to load default RBT balance:', error)
      return null
    }
  }

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
        const defaultNetwork = this.pickDefaultNetwork(availableNetworks)
        if (!defaultNetwork) {
          throw new SDKError(
            '사용 가능한 네트워크가 없습니다',
            SDKErrorCode.NETWORK_ERROR
          )
        }
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

      // 4. 네이티브 코인 잔액 조회
      console.log('4. 잔액 조회 시작')
      const nativeBalance = await this.core.wallet.getBalance(
        address,
        network.chainId
      )
      console.log('네이티브 코인 잔액:', nativeBalance)

      // 5. 최근 트랜잭션 조회
      console.log('5. 최근 트랜잭션 조회 시작')
      const latestTransaction = await this.core.wallet.getLatestTransaction(
        address,
        network.chainId
      )
      console.log('최근 트랜잭션:', latestTransaction)

      // 6. 등록된 토큰(백엔드 DB) 조회 및 잔액 계산
      let tokens: TokenInfo[] = []
      try {
        const registered = await this.core.asset.getRegisteredCoins(network.id)
        const targetCoins = this.withDefaultRegisteredCoins(
          network,
          (registered ?? []) as RegisteredCoin[]
        )
        const tokenMap = new Map<string, TokenInfo>()

        if (targetCoins.length) {
          const results = await Promise.allSettled(
            targetCoins.map(async (coin) => {
              const full = await this.core.asset.getTokenFullInfo({
                networkId: network.id,
                tokenAddress: coin.contractAddress,
                walletAddress: address,
              })

              return {
                ...full,
                address: coin.contractAddress,
                name: coin.name ?? full.name,
                symbol: coin.symbol ?? full.symbol,
                decimals:
                  typeof coin.decimals === 'number'
                    ? coin.decimals
                    : full.decimals,
              }
            })
          )

          results.forEach((result) => {
            if (result.status === 'fulfilled') {
              tokenMap.set(
                result.value.address.toLowerCase(),
                result.value as TokenInfo
              )
              return
            }
            console.warn('Registered token load failed:', result.reason)
          })
        }

        if (network.chainId === FUJI_CHAIN_ID) {
          const rbtToken = await this.getFujiRbtTokenInfo(network.id, address)
          if (rbtToken) {
            tokenMap.set(rbtToken.address.toLowerCase(), rbtToken)
          }
        }

        tokens = Array.from(tokenMap.values())
      } catch (e) {
        // Don't fail the whole wallet-info if token listing fails.
        console.warn('Registered token load failed:', e)
        tokens = []
      }

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
          tokens,
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
