import { BlockchainRequest } from '@/clients/types'
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
    isLoggedIn(): Promise<boolean>
    getAuthInfo(): Promise<{
      firebaseId?: string
      accessToken?: string
      isNewUser?: boolean
    }>
    clearNewUserFlag(): Promise<void>
  }

  wallet: {
    getInfo(): Promise<WalletInfo>
    create(password: string): Promise<string>
    retrieveWallet(password: string): Promise<string>
    getBalance(address: string, chainId: number): Promise<string>
    getTransactionCount(address: string, chainId: number): Promise<number>
    getBlockNumber(chainId: number): Promise<number>
    sendRawTransaction(signedTx: string, chainId: number): Promise<string>
    getTransactionReceipt(txHash: string, chainId: number): Promise<any>
    getTransaction(txHash: string, chainId: number): Promise<any>
    estimateGas(txParams: any, chainId: number): Promise<number>
    getGasPrice(chainId: number): Promise<string>
    call(
      txParams: any,
      blockParam: string | number,
      chainId: number
    ): Promise<string>
  }

  network: {
    getRegisteredNetworks(): Promise<NetworkInfo[]>
    getCurrentNetwork(): Promise<NetworkInfo | null>
    registerNetwork(params: BlockchainRequest): Promise<void>
    switchNetwork(networkId: string): Promise<void>
  }
}
