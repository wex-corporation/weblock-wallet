import {
  SDKOptions,
  TransferRequest,
  TransferResponse,
  TokenBalanceParams,
  TokenApprovalParams,
  TokenAllowanceParams,
  TokenInfoParams,
  TokenInfo,
} from '../types'
import { InternalCore } from '../core/types'
import { TokenMetadata } from '@/core/services/asset'

export class AssetModule {
  constructor(
    private readonly options: SDKOptions,
    private readonly core: InternalCore
  ) {}

  async transfer(params: TransferRequest): Promise<TransferResponse> {
    return this.core.asset.transfer(params)
  }

  async addToken(params: {
    type: 'ERC20' | 'SECURITY'
    networkId: string
    address: string
    symbol?: string
    decimals?: number
    name?: string
  }): Promise<void> {
    return this.core.asset.addToken(params)
  }

  async addNFTCollection(params: {
    networkId: string
    address: string
    name?: string
  }): Promise<void> {
    return this.core.asset.addNFTCollection(params)
  }

  // async checkSecurityTokenCompliance(params: {
  //   networkId: string
  //   tokenAddress: string
  //   from: string
  //   to: string
  //   amount: string
  // }): Promise<{
  //   canTransfer: boolean
  //   reasons?: string[]
  // }> {
  //   return this.core.asset.checkSecurityTokenCompliance(params)
  // }

  async getTokenBalance(params: TokenBalanceParams): Promise<string> {
    return this.core.asset.getTokenBalance(params)
  }

  async approveToken(params: TokenApprovalParams): Promise<string> {
    return this.core.asset.approveToken(params)
  }

  async getAllowance(params: TokenAllowanceParams): Promise<string> {
    return this.core.asset.getAllowance(params)
  }

  async getTokenInfo(params: TokenInfoParams): Promise<TokenMetadata> {
    return this.core.asset.getTokenInfo(params)
  }

  async registerToken(params: {
    networkId: string
    tokenAddress: string
  }): Promise<void> {
    return this.core.asset.registerToken(params)
  }

  async getTokenFullInfo(params: {
    networkId: string
    tokenAddress: string
    walletAddress: string
  }): Promise<TokenInfo> {
    return this.core.asset.getTokenFullInfo(params)
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.core.asset.on(event, listener)
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.core.asset.off(event, listener)
  }
}
