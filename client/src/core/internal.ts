// src/core/internal.ts
import {
  SDKOptions,
  SignInResponse,
  WalletResponse,
  WalletInfo,
  NetworkInfo,
  SwitchNetworkResponse,
  TransferRequest,
  TransferResponse,
} from '../types'

export class InternalCore {
  constructor(private readonly options: SDKOptions) {}

  auth = {
    signIn: async (_provider: string): Promise<SignInResponse> => {
      return {} as SignInResponse
    },
    signOut: async (): Promise<void> => {
      // 임시 구현
    },
  }

  wallet = {
    create: async (_password: string): Promise<WalletResponse> => {
      return {} as WalletResponse
    },
    recover: async (_password: string): Promise<WalletResponse> => {
      return {} as WalletResponse
    },
    getInfo: async (): Promise<WalletInfo> => {
      return {} as WalletInfo
    },
  }

  network = {
    switch: async (_networkId: string): Promise<SwitchNetworkResponse> => {
      return {} as SwitchNetworkResponse
    },
    getNetworks: async (): Promise<NetworkInfo[]> => {
      return []
    },
  }

  asset = {
    transfer: async (_params: TransferRequest): Promise<TransferResponse> => {
      return {} as TransferResponse
    },
  }
}
