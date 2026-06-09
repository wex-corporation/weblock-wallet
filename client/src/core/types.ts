import { BlockchainRequest } from '@/clients/types'
import {
  NetworkInfo,
  SendTransactionParams,
  TokenAllowanceParams,
  TokenApprovalParams,
  TokenBalance,
  TokenBalanceParams,
  ERC1155BalanceParams,
  RbtClaimableParams,
  RbtClaimParams,
  TokenInfo,
  TokenInfoParams,
  Transaction,
  TransferRequest,
  TransferResponse,
} from '../types'
import { TokenMetadata } from './services/asset'
import {
  GetOfferingParams,
  OfferingView,
  InvestRbtParams,
  InvestRbtResult,
  ClaimRbtRevenueParams,
  ClaimRbtRevenueResult,
  GetSeriesParams,
  SeriesView,
  InvestRbtV2Params,
  InvestRbtV2Result,
  ClaimInterestV2Params,
  ClaimInterestV2Result,
  RedeemRbtV2Params,
  RedeemRbtV2Result,
  GetPendingInterestParams,
} from '../types/investment'

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

    /** Reset PIN using device recovery material (encryptedShare2_device). */
    resetPin(newPassword: string): Promise<string>

    getBalance(address: string, chainId: number): Promise<TokenBalance>
    getTokenBalance(
      tokenAddress: string,
      walletAddress: string,
      chainId: number
    ): Promise<TokenBalance>
    sendTransaction(params: SendTransactionParams): Promise<string>
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
    getTokenBalance: (params: TokenBalanceParams) => Promise<string>
    /** ERC-1155 balanceOf(account, tokenId) */
    getERC1155Balance: (params: ERC1155BalanceParams) => Promise<string>

    /** RBTPropertyToken claimable(tokenId, account) */
    getRbtClaimable: (params: RbtClaimableParams) => Promise<string>

    /** RBTPropertyToken claim(tokenId) -> txHash */
    claimRbt: (params: RbtClaimParams) => Promise<string>
    approveToken: (params: TokenApprovalParams) => Promise<string>
    getAllowance: (params: TokenAllowanceParams) => Promise<string>
    // getTokenInfo: (params: TokenInfoParams) => Promise<TokenInfo>
    addNFTCollection: (params: {
      networkId: string
      address: string
      name?: string
    }) => Promise<void>
    // checkSecurityTokenCompliance: (params: {
    //   networkId: string
    //   tokenAddress: string
    //   from: string
    //   to: string
    //   amount: string
    // }) => Promise<{ canTransfer: boolean; reasons?: string[] }>
    on(event: string, listener: (...args: any[]) => void): void
    off(event: string, listener: (...args: any[]) => void): void
    // 토큰 정보 조회
    getTokenInfo(params: TokenInfoParams): Promise<TokenMetadata>

    // 토큰 등록
    registerToken(params: {
      networkId: string
      tokenAddress: string
    }): Promise<void>

    // 토큰 전체 정보 조회
    getTokenFullInfo(params: {
      networkId: string
      tokenAddress: string
      walletAddress: string
    }): Promise<TokenInfo>

    /**
     * Get tokens registered for the current user on the given blockchain.
     * - `networkId` here is the Wallet Backend's blockchainId (UUID).
     */
    getRegisteredCoins(networkId: string): Promise<
      Array<{
        id: string
        blockchainId: string
        name: string
        symbol: string
        contractAddress: string
        decimals: number
      }>
    >
  }

  investment: {
    // v1 (legacy SaleRouter)
    getOffering(params: GetOfferingParams): Promise<OfferingView>
    investRbtWithUsdr(params: InvestRbtParams): Promise<InvestRbtResult>
    claimRbtRevenue(params: ClaimRbtRevenueParams): Promise<ClaimRbtRevenueResult>
    getClaimable(params: {
      networkId: string
      rbtAssetAddress: string
      seriesId: bigint | number | string
      account?: string
    }): Promise<string>
    getRbtBalance(params: {
      networkId: string
      rbtAssetAddress: string
      seriesId: bigint | number | string
      account?: string
    }): Promise<string>
    // v2 (RBTSeriesManager)
    getSeriesV2(params: GetSeriesParams): Promise<SeriesView>
    investRbtV2(params: InvestRbtV2Params): Promise<InvestRbtV2Result>
    claimInterestV2(params: ClaimInterestV2Params): Promise<ClaimInterestV2Result>
    redeemRbtV2(params: RedeemRbtV2Params): Promise<RedeemRbtV2Result>
    getPendingInterestV2(params: GetPendingInterestParams): Promise<string>
    on(event: string, listener: (...args: any[]) => void): void
    off(event: string, listener: (...args: any[]) => void): void
  }
}
