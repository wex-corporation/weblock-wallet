import { SDKOptions } from '../types'
import { InternalCore } from '../core/types'
import {
  BuyRwaProductParams,
  BuyRwaProductResult,
  ClaimAllRwaInterestParams,
  ClaimRbtRevenueParams,
  ClaimRbtRevenueResult,
  ClaimRwaInterestParams,
  ClaimRwaInterestResult,
  GetClaimableRwaInterestParams,
  GetOfferingParams,
  GetRwaBalanceParams,
  GetRwaOfferingParams,
  InvestRbtParams,
  InvestRbtResult,
  OfferingView,
  PreviewRedeemRwaParams,
  PreviewRedeemRwaResult,
  RedeemRwaParams,
  RedeemRwaResult,
  RwaOfferingView,
} from '../types/investment'

export class InvestmentModule {
  constructor(
    private readonly options: SDKOptions,
    private readonly core: InternalCore
  ) {}

  getOffering(params: GetOfferingParams): Promise<OfferingView> {
    return this.core.investment.getOffering(params)
  }

  investRbtWithUsdr(params: InvestRbtParams): Promise<InvestRbtResult> {
    return this.core.investment.investRbtWithUsdr(params)
  }

  claimRbtRevenue(
    params: ClaimRbtRevenueParams
  ): Promise<ClaimRbtRevenueResult> {
    return this.core.investment.claimRbtRevenue(params)
  }

  getClaimable(params: {
    networkId: string
    rbtAssetAddress: string
    seriesId: bigint | number | string
    account?: string
  }): Promise<string> {
    return this.core.investment.getClaimable(params)
  }

  getRbtBalance(params: {
    networkId: string
    rbtAssetAddress: string
    seriesId: bigint | number | string
    account?: string
  }): Promise<string> {
    return this.core.investment.getRbtBalance(params)
  }

  getRwaOffering(params: GetRwaOfferingParams): Promise<RwaOfferingView> {
    return this.core.investment.getRwaOffering(params)
  }

  buyRwaProduct(params: BuyRwaProductParams): Promise<BuyRwaProductResult> {
    return this.core.investment.buyRwaProduct(params)
  }

  claimRwaInterest(
    params: ClaimRwaInterestParams
  ): Promise<ClaimRwaInterestResult> {
    return this.core.investment.claimRwaInterest(params)
  }

  claimAllRwaInterest(
    params: ClaimAllRwaInterestParams
  ): Promise<ClaimRwaInterestResult> {
    return this.core.investment.claimAllRwaInterest(params)
  }

  getClaimableRwaInterest(
    params: GetClaimableRwaInterestParams
  ): Promise<string> {
    return this.core.investment.getClaimableRwaInterest(params)
  }

  getRwaBalance(params: GetRwaBalanceParams): Promise<string> {
    return this.core.investment.getRwaBalance(params)
  }

  redeemRwa(params: RedeemRwaParams): Promise<RedeemRwaResult> {
    return this.core.investment.redeemRwa(params)
  }

  previewRedeemRwa(
    params: PreviewRedeemRwaParams
  ): Promise<PreviewRedeemRwaResult> {
    return this.core.investment.previewRedeemRwa(params)
  }

  getRewardTokens(params: {
    networkId: string
    interestVaultAddress: string
    productId: bigint | number | string
  }): Promise<string[]> {
    return this.core.investment.getRewardTokens(params)
  }

  getPayoutTokens(params: {
    networkId: string
    redemptionVaultAddress: string
    productId: bigint | number | string
  }): Promise<string[]> {
    return this.core.investment.getPayoutTokens(params)
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.core.investment.on(event, listener)
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.core.investment.off(event, listener)
  }
}
