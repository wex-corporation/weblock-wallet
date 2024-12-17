// src/types/core.ts
import {
  SignInResponse,
  WalletResponse,
  WalletInfo,
  NetworkInfo,
  SwitchNetworkResponse,
  TransferRequest,
  TransferResponse,
} from './index'

export interface InternalCore {
  auth: AuthCore
  wallet: WalletCore
  network: NetworkCore
  asset: AssetCore
}

interface AuthCore {
  signIn(provider: string): Promise<SignInResponse>
  signOut(): Promise<void>
}

interface WalletCore {
  create(password: string): Promise<WalletResponse>
  recover(password: string): Promise<WalletResponse>
  getInfo(): Promise<WalletInfo>
}

interface NetworkCore {
  switch(networkId: string): Promise<SwitchNetworkResponse>
  getNetworks(): Promise<NetworkInfo[]>
}

interface AssetCore {
  transfer(params: TransferRequest): Promise<TransferResponse>
}
