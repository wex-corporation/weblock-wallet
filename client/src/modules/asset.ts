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

  // async getTokenInfo(params: TokenInfoParams): Promise<TokenInfo> {
  //   return this.core.asset.getTokenInfo(params)
  // }
}
