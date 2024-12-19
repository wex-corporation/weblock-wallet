import { BlockchainRequest } from '@/clients/types'
import {
  NetworkInfo,
  TokenAllowanceParams,
  TokenApprovalParams,
  TokenBalanceParams,
  TokenInfo,
  TokenInfoParams,
  Transaction,
  TransferRequest,
  TransferResponse,
} from '../types'

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
    getAddress(): Promise<string>
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
    getLatestTransaction(
      address: string,
      chainId: number
    ): Promise<Transaction | undefined>
  }

  network: {
    getRegisteredNetworks(): Promise<NetworkInfo[]>
    getCurrentNetwork(): Promise<NetworkInfo | null>
    registerNetwork(params: BlockchainRequest): Promise<void>
    switchNetwork(networkId: string): Promise<void>
  }

  asset: {
    transfer: (params: TransferRequest) => Promise<TransferResponse>
    addToken: (params: {
      type: 'ERC20' | 'SECURITY'
      networkId: string
      address: string
      symbol?: string
      decimals?: number
      name?: string
    }) => Promise<void>
    // New ERC20 methods
    getTokenBalance: (params: TokenBalanceParams) => Promise<string>
    approveToken: (params: TokenApprovalParams) => Promise<string>
    getAllowance: (params: TokenAllowanceParams) => Promise<string>
    getTokenInfo: (params: TokenInfoParams) => Promise<TokenInfo>
    addNFTCollection: (params: {
      networkId: string
      address: string
      name?: string
    }) => Promise<void>
    checkSecurityTokenCompliance: (params: {
      networkId: string
      tokenAddress: string
      from: string
      to: string
      amount: string
    }) => Promise<{ canTransfer: boolean; reasons?: string[] }>
  }
}
