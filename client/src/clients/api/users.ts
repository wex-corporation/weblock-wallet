// src/clients/api/users.ts
import { HttpClient } from '../http'
import {
  SignInRequest,
  SignInResponse,
  BlockchainRequest,
  TokenRequest,
  UserResponse,
  BlockchainResponse,
  TokenResponse,
  RegisterTokenRequest,
  RegisterTokenResponse,
  CoinResponse,
} from '../types'

export class UserClient {
  private readonly baseUrl = '/v1/users'

  constructor(private readonly client: HttpClient) {}

  async signIn(request: SignInRequest): Promise<SignInResponse> {
    return this.client.post(`${this.baseUrl}/sign-in`, request, {
      needsAccessToken: false,
    })
  }

  async getUser(): Promise<UserResponse> {
    return this.client.get(`${this.baseUrl}`, { needsAccessToken: true })
  }

  /** TODO: Add duplicate chainId validation */
  async registerBlockchain(request: BlockchainRequest): Promise<void> {
    await this.client.post(`${this.baseUrl}/register-blockchain`, request, {
      needsAccessToken: true,
    })
  }

  async getRegisteredBlockchains(): Promise<BlockchainResponse[]> {
    return this.client.get(`${this.baseUrl}/blockchains`, {
      needsAccessToken: true,
    })
  }

  // async registerToken(request: TokenRequest): Promise<TokenResponse> {
  //   return this.client.post(`${this.baseUrl}/register-token`, request, {
  //     needsAccessToken: true,
  //   })
  // }

  /**
   * POST /v1/users/register-token
   *
   * 백엔드가 아래 중 어떤 스펙이든 동작하도록:
   * - 최소 요청형: { blockchainId, contractAddress }
   * - 풀 요청형:  { blockchainId, contractAddress, name, symbol, decimals }
   *
   * 또한 응답이 아래 중 어떤 형태든 파싱:
   * - CoinResponse
   * - { coin: CoinResponse }
   * - { data: CoinResponse }
   */
  async registerToken(req: RegisterTokenRequest): Promise<TokenResponse> {
    const blockchainId = (req as any).blockchainId
    const contractAddress = this.normalizeAddress((req as any).contractAddress)

    // 풀 요청형 메타 (있을 수도, 없을 수도)
    const name = (req as any).name
    const symbol = (req as any).symbol
    const decimals = (req as any).decimals

    // 백엔드가 필드명을 바꾼 케이스까지 방어적으로 커버
    const candidates: any[] = [
      // 1) 최신 스펙으로 바뀌며 "주소만" 받는 경우
      { blockchainId, contractAddress },

      // 2) 필드명이 tokenAddress / address로 바뀐 경우
      { blockchainId, tokenAddress: contractAddress },
      { blockchainId, address: contractAddress },

      // 3) 구 스펙(메타 포함) 유지/필요한 경우
      ...(name && symbol && typeof decimals === 'number'
        ? [
            { blockchainId, contractAddress, name, symbol, decimals },
            {
              blockchainId,
              tokenAddress: contractAddress,
              name,
              symbol,
              decimals,
            },
            { blockchainId, address: contractAddress, name, symbol, decimals },
          ]
        : []),

      // 4) blockchainId가 networkId로 바뀐 경우
      ...(name && symbol && typeof decimals === 'number'
        ? [
            {
              networkId: blockchainId,
              contractAddress,
              name,
              symbol,
              decimals,
            },
            {
              networkId: blockchainId,
              tokenAddress: contractAddress,
              name,
              symbol,
              decimals,
            },
          ]
        : [{ networkId: blockchainId, contractAddress }]),
    ]

    let lastError: any = null

    for (const body of candidates) {
      try {
        const res = await this.client.post<RegisterTokenResponse>(
          `${this.baseUrl}/register-token`,
          body,
          {
            // register-token 은 사용자 컨텍스트가 필요한 엔드포인트이므로
            // 반드시 Authorization: Bearer <JWT> 가 포함되어야 한다.
            needsAccessToken: true,
          }
        )
        const coin = this.unwrapCoin(res)
        // 응답이 없거나 이상하면 다음 후보 시도
        if (!coin?.contractAddress) {
          continue
        }
        // contractAddress normalize (혹시 서버가 원본 케이스로 주는 경우)
        return {
          ...coin,
          contractAddress: this.normalizeAddress(coin.contractAddress),
          decimals: Number((coin as any).decimals),
        }
      } catch (e: any) {
        lastError = e

        const status = this.extractStatus(e)

        // 400/422는 "스펙 불일치" 가능성이 크므로 다음 후보 시도
        if (status === 400 || status === 422) continue

        // 409(이미 존재) 같은 케이스도 서버 구현에 따라 올 수 있으니 다음 시도 혹은 정상 취급 가능
        if (status === 409) continue

        // 나머지는 진짜 장애로 판단하고 즉시 throw
        throw e
      }
    }

    // 모든 후보가 실패한 경우
    throw lastError ?? new Error('registerToken failed')
  }

  private unwrapCoin(res: any): CoinResponse | null {
    if (!res) return null
    if (res.coin) return res.coin
    if (res.data) return res.data
    return res as CoinResponse
  }

  private normalizeAddress(address: string): string {
    return (address ?? '').trim().toLowerCase()
  }

  private extractStatus(e: any): number | undefined {
    // HttpClient 구현체마다 에러 모양이 달라서 방어적으로 처리
    return (
      e?.status ??
      e?.response?.status ??
      e?.cause?.status ??
      e?.cause?.response?.status
    )
  }

  async getRegisteredCoins(blockchainId: string): Promise<TokenResponse[]> {
    return this.client.get(
      `${this.baseUrl}/coins?blockchainId=${blockchainId}`,
      { needsAccessToken: true }
    )
  }
}
