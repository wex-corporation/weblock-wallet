// src/module/wallet.ts
import { SDKOptions, WalletAPI, TransactionRequest } from '../types'

export class WalletModule implements WalletAPI {
  constructor(private readonly options: SDKOptions) {}

  async create(): Promise<void> {
    throw new Error('Not implemented')
  }

  async connect(): Promise<void> {
    throw new Error('Not implemented')
  }

  async disconnect(): Promise<void> {
    throw new Error('Not implemented')
  }

  async getAddress(): Promise<string> {
    throw new Error('Not implemented')
  }

  async signMessage(_message: string): Promise<string> {
    throw new Error('Not implemented')
  }

  async signTransaction(_transaction: TransactionRequest): Promise<string> {
    throw new Error('Not implemented')
  }
}
