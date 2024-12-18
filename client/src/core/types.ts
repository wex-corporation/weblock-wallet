import { WalletInfo, NetworkInfo } from '../types'

export interface InternalCore {
  auth: {
    signIn(provider: string): Promise<{
      isNewUser: boolean
      email: string
      photoURL: string | null
      status: 'WALLET_READY' | 'NEEDS_PASSWORD' | 'NEW_USER'
    }>
    signOut(): Promise<void>
  }

  wallet: {
    getInfo(): Promise<WalletInfo>
    create(password: string): Promise<{ wallet: WalletInfo }>
    recover(password: string): Promise<{ wallet: WalletInfo }>
  }

  network: {
    switch(networkId: string): Promise<{ network: NetworkInfo }>
    getNetworks(): Promise<NetworkInfo[]>
  }
}
