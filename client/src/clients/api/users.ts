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
    return this.client.get(`${this.baseUrl}`)
  }

  async registerBlockchain(request: BlockchainRequest): Promise<void> {
    await this.client.post(`${this.baseUrl}/blockchains`, request)
  }

  async getRegisteredBlockchains(): Promise<BlockchainResponse[]> {
    return this.client.get(`${this.baseUrl}/blockchains`)
  }

  async registerToken(request: TokenRequest): Promise<TokenResponse> {
    return this.client.post(`${this.baseUrl}/register-token`, request)
  }

  async getRegisteredCoins(blockchainId: string): Promise<TokenResponse[]> {
    return this.client.get(`${this.baseUrl}/coins?blockchainId=${blockchainId}`)
  }
}
