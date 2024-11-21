// core/src/infra/clients/wallets.ts
import { Client } from '../utils/httpClient'
import { Wallet } from '@weblock-wallet/types'
import {
  CreateWalletRequest,
  UpdateWalletKeyRequest
} from '@weblock-wallet/types'

export class WalletClient {
  private readonly baseUrl = '/v1/wallets'
  public readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  async createWallet(request: CreateWalletRequest): Promise<void> {
    await this.client.post(this.baseUrl, request)
  }

  async getWallet(): Promise<Wallet> {
    const response = await this.client.get<Wallet>(this.baseUrl)
    if (response == null) {
      throw new Error('Wallet not found')
    }
    return response
  }

  async updateWalletKey(request: UpdateWalletKeyRequest): Promise<void> {
    await this.client.patch(`${this.baseUrl}/keys`, request)
  }
}
