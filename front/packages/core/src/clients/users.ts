// core/src/infra/clients/users.ts
import { Client } from '../utils/httpClient'
import {
  Blockchain,
  Coin,
  SignInRequest,
  SignInResponse,
  RegisterBlockchainRequest,
  RegisterTokenRequest,
  User
} from '@weblock-wallet/types'

export class UserClient {
  private readonly baseUrl = '/v1/users'
  public readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  async signIn(request: SignInRequest): Promise<SignInResponse> {
    const response = await this.client.post<SignInResponse>(
      `${this.baseUrl}/sign-in`,
      request,
      { needsAccessToken: false }
    )

    if (response == null) {
      throw new Error('Failed to sign in')
    }

    return response
  }

  async getUser(): Promise<User> {
    const response = await this.client.get<User>(`${this.baseUrl}`)
    if (!response) {
      throw new Error('User not found')
    }
    return response
  }

  async registerBlockchain(request: RegisterBlockchainRequest): Promise<void> {
    await this.client.post<void>(`${this.baseUrl}/blockchains`, request)
  }

  async getRegisteredBlockchains(): Promise<Blockchain[]> {
    const response = await this.client.get<Blockchain[]>(
      `${this.baseUrl}/blockchains`
    )
    if (!response) {
      throw new Error('Failed to get registered blockchains')
    }
    return response
  }

  async registerToken(request: RegisterTokenRequest): Promise<Coin> {
    const response = await this.client.post<Coin>(
      `${this.baseUrl}/register-token`,
      request
    )
    if (!response) {
      throw new Error('Failed to register token')
    }
    return response
  }

  async getRegisteredCoins(blockchainId: string): Promise<Coin[]> {
    const response = await this.client.get<Coin[]>(
      `${this.baseUrl}/coins?blockchainId=${blockchainId}`
    )
    if (!response) {
      throw new Error('User not found')
    }
    return response
  }
}
