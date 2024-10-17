import { Users } from '@alwallet/core/src/module/users' // Users 모듈
import { SDKError } from '../utils/errors' // SDK 에러 핸들링
import { Blockchain } from '@alwallet/core/src/domains' // Blockchain 타입 정의

export class Blockchains {
  private users: Users // Users 모듈을 사용하여 블록체인 관련 API 호출

  constructor(users: Users) {
    this.users = users
  }

  /**
   * 블록체인 등록
   * @param name 블록체인 이름
   * @param rpcUrl 블록체인 RPC URL
   * @param chainId 체인 ID
   * @param currencySymbol 통화 심볼
   * @param currencyName 통화 이름
   * @param currencyDecimals 소수점 자리수
   * @param explorerUrl 탐색기 URL
   * @param isTestnet 테스트넷 여부
   * @returns 등록 성공 여부 (void 반환)
   */
  public async registerBlockchain(
    name: string,
    rpcUrl: string,
    chainId: number,
    currencySymbol: string,
    currencyName: string,
    currencyDecimals: number,
    explorerUrl: string,
    isTestnet: boolean
  ): Promise<void> {
    try {
      await this.users.registerBlockchain(
        name,
        rpcUrl,
        chainId,
        currencySymbol,
        currencyName,
        currencyDecimals,
        explorerUrl,
        isTestnet
      )

      console.log(`블록체인 ${name}이(가) 성공적으로 등록되었습니다.`)
    } catch (error) {
      const err = error as Error
      throw new SDKError(`블록체인 등록 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  /**
   * 등록된 블록체인 목록 조회
   * @returns 등록된 블록체인 배열
   */
  public async getRegisteredBlockchains(): Promise<Blockchain[]> {
    try {
      const blockchains: Blockchain[] =
        await this.users.getRegisteredBlockchains()
      return blockchains
    } catch (error) {
      const err = error as Error
      throw new SDKError(
        `등록된 블록체인 목록 조회 중 오류가 발생했습니다: ${err.message}`
      )
    }
  }
}
