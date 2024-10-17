import { Wallets as CoreWallets } from '@alwallet/core/src/module/wallets'
import { WalletServerHttpClient } from '@alwallet/core/src/utils/httpClient'
import { SDKError } from '../utils/errors' // Error handling
import { Coin } from '@alwallet/core/src/domains' // Coin 타입 정의
import { ERC20Info } from '@alwallet/core/src/module/wallets' // ERC20 토큰 정보
import { Blockchain } from '@alwallet/core/src/domains' // 블록체인 타입 정의
import { Users } from '@alwallet/core/src/module/users' // Users 모듈
import Web3 from 'web3' // Web3 사용
import { ERC20_ABI } from '@alwallet/core/src/contract/contracts' // ERC20 ABI

export class Tokens {
  private coreWallets: CoreWallets // Core Wallets 인스턴스 사용
  private users: Users // Users 모듈 사용

  constructor(client: WalletServerHttpClient, users: Users) {
    this.coreWallets = new CoreWallets(client)
    this.users = users
  }

  /**
   * ERC20 토큰 등록
   * @param chainId 블록체인 ID
   * @param contractAddress 토큰 계약 주소
   * @returns 등록된 Coin 객체
   */
  public async registerToken(
    chainId: number,
    contractAddress: string
  ): Promise<Coin> {
    try {
      // 1. 먼저 사용자가 등록한 블록체인 목록을 가져옵니다.
      const blockchains: Blockchain[] =
        await this.users.getRegisteredBlockchains()

      // 2. 등록된 블록체인 중 해당 chainId에 맞는 블록체인을 찾습니다.
      const blockchain = blockchains.find((bc) => bc.chainId === chainId)
      if (!blockchain) {
        throw new SDKError(
          `블록체인 ID ${chainId}에 해당하는 블록체인이 등록되지 않았습니다.`
        )
      }

      // 3. 블록체인의 RPC URL을 사용하여 토큰 정보를 가져옵니다.
      const tokenInfo: ERC20Info = await this.coreWallets.getCoinInfo(
        blockchain.rpcUrl,
        contractAddress
      )

      // 4. 가져온 토큰 정보를 사용해 토큰을 등록합니다.
      const registeredToken = await this.users.registerToken(
        blockchain.id,
        contractAddress,
        tokenInfo.name,
        tokenInfo.symbol,
        tokenInfo.decimals
      )

      return registeredToken
    } catch (error) {
      const err = error as Error
      throw new SDKError(`토큰 등록 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  /**
   * 토큰 정보 조회
   * @param nodeUrl 블록체인 노드 URL
   * @param contractAddress 토큰 계약 주소
   * @returns ERC20 토큰 정보 (name, symbol, decimals)
   */
  public async getTokenInfo(
    nodeUrl: string,
    contractAddress: string
  ): Promise<ERC20Info> {
    try {
      return await this.coreWallets.getCoinInfo(nodeUrl, contractAddress)
    } catch (error) {
      const err = error as Error
      throw new SDKError(
        `토큰 정보 조회 중 오류가 발생했습니다: ${err.message}`
      )
    }
  }

  /**
   * ERC20 토큰 잔액 조회
   * @param chainId 블록체인 ID
   * @param contractAddress 토큰 계약 주소
   * @returns 잔액 (문자열)
   */
  public async getTokenBalance(
    chainId: number,
    contractAddress: string
  ): Promise<string> {
    try {
      // 지갑이 있는지 확인
      if (!this.coreWallets.wallet) {
        throw new SDKError('지갑을 먼저 복구해야 합니다.')
      }

      // 지갑 주소가 필요합니다.
      const walletAddress = this.coreWallets.wallet.address

      // 해당 체인의 블록체인 목록을 가져옵니다.
      const blockchains: Blockchain[] =
        await this.users.getRegisteredBlockchains()
      const blockchain = blockchains.find((bc) => bc.chainId === chainId)
      if (!blockchain) {
        throw new SDKError(
          `블록체인 ID ${chainId}에 해당하는 블록체인이 등록되지 않았습니다.`
        )
      }

      // Web3 인스턴스를 생성하여 ERC20 잔액을 조회합니다.
      const web3 = new Web3(blockchain.rpcUrl)
      const tokenContract = new web3.eth.Contract(ERC20_ABI, contractAddress)

      // 토큰 잔액 조회
      const tokenBalance = await tokenContract.methods
        .balanceOf(walletAddress)
        .call()

      // 잔액을 반환합니다.
      return web3.utils.fromWei(tokenBalance, 'ether') // 필요한 경우 단위를 조정하세요
    } catch (error) {
      const err = error as Error
      throw new SDKError(
        `토큰 잔액 조회 중 오류가 발생했습니다: ${err.message}`
      )
    }
  }

  /**
   * 등록된 코인 목록 조회
   * @param chainId 블록체인 ID
   * @returns Coin[] (코인 목록)
   */
  public async getCoins(chainId: number): Promise<Coin[]> {
    try {
      const blockchains: Blockchain[] =
        await this.users.getRegisteredBlockchains()
      const blockchain = blockchains.find((bc) => bc.chainId === chainId)
      if (!blockchain) {
        throw new SDKError(
          `블록체인 ID ${chainId}에 해당하는 블록체인이 등록되지 않았습니다.`
        )
      }

      // 사용자가 등록한 코인 목록을 가져옵니다.
      const coins = await this.users.getRegisteredCoins(blockchain.id)
      return coins
    } catch (error) {
      const err = error as Error
      throw new SDKError(
        `코인 목록 조회 중 오류가 발생했습니다: ${err.message}`
      )
    }
  }
}
