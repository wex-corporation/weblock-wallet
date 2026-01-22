// src/clients/api/wallets.ts
import { HttpClient } from '../http'
import {
  CreateWalletRequest,
  UpdateWalletKeyRequest,
  WalletResponse,
  UpsertDeviceRecoveryRequest,
  DeviceRecoveryResponse,
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

  async getDeviceShare2Backup(): Promise<{
    encryptedShare2Device: string
  } | null> {
    try {
      return await this.client.get<{ encryptedShare2Device: string }>(
        '/api/v1/wallet/device-share2',
        { needsAccessToken: true }
      )
    } catch (e: any) {
      // If 404, treat as no backup
      if (
        e?.details?.status === 404 ||
        String(e?.message || '').includes('404')
      )
        return null
      throw e
    }
  }

  async upsertDeviceShare2Backup(body: {
    encryptedShare2Device: string
  }): Promise<void> {
    await this.client.put<void>('/api/v1/wallet/device-share2', body, {
      needsAccessToken: true,
    })
  }

  async upsertDeviceRecovery(req: UpsertDeviceRecoveryRequest): Promise<void> {
    await this.client.put(`${this.baseUrl}/device-recovery`, req, {
      needsAccessToken: true,
    })
  }

  /**
   * If deviceId is omitted, server returns latest.
   * Returns { found:false } if no backup exists.
   */
  async getDeviceRecovery(deviceId?: string): Promise<DeviceRecoveryResponse> {
    const qs = deviceId ? `?deviceId=${encodeURIComponent(deviceId)}` : ''
    return this.client.get(`${this.baseUrl}/device-recovery${qs}`, {
      needsAccessToken: true,
    })
  }
}
