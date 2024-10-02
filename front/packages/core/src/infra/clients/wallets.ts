import { Client } from '../../utils/httpClient'
import * as domain from '../../domains'

export interface CreateWalletRequest {
  address: string
  publicKey: string
  share1: string
  encryptedShare3: string
}

export interface UpdateWalletKeyRequest {
  share1: string
  encryptedShare3: string
}

export class WalletClient {
  private readonly baseUrl = '/v1/wallets'
  public readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  async createWallet(request: CreateWalletRequest): Promise<void> {
    await this.client.post(this.baseUrl, request)
  }

  async getWallet(): Promise<domain.Wallet> {
    const response = await this.client.get<domain.Wallet>(this.baseUrl)
    if (response == null) {
      throw new Error('Wallet not found')
    }
    return response
  }

  async updateWalletKey(request: UpdateWalletKeyRequest): Promise<void> {
    await this.client.patch(`${this.baseUrl}/keys`, request)
  }
}
