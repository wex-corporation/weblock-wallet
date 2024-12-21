// src/clients/api/wallets.ts
import { HttpClient } from '../http'
import {
  CreateWalletRequest,
  UpdateWalletKeyRequest,
  WalletResponse,
} from '../types'

export class WalletClient {
  private readonly baseUrl = '/v1/wallets'

  constructor(private readonly client: HttpClient) {}

  async createWallet(request: CreateWalletRequest): Promise<void> {
    await this.client.post(this.baseUrl, request, { needsAccessToken: true })
  }

  async getWallet(): Promise<WalletResponse> {
    return this.client.get(this.baseUrl, { needsAccessToken: true })
  }

  async updateWalletKey(request: UpdateWalletKeyRequest): Promise<void> {
    await this.client.patch(`${this.baseUrl}/keys`, request, {
      needsAccessToken: true,
    })
  }
}
