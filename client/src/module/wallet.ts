// src/module/wallet.ts
import { SDKOptions, WalletAPI } from '../types'

export class WalletModule implements WalletAPI {
  constructor(private readonly options: SDKOptions) {}

  async create(password: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async recover(password: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async getAddress(): Promise<string> {
    throw new Error('Not implemented')
  }
}
