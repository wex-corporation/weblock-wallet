import { SDKOptions } from '../types'
import { InternalCore } from '../core/types'
import {
  GetOfferingParams,
  OfferingView,
  InvestRbtParams,
  InvestRbtResult,
  ClaimRbtRevenueParams,
  ClaimRbtRevenueResult,
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

  on(event: string, listener: (...args: any[]) => void): void {
    this.core.investment.on(event, listener)
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.core.investment.off(event, listener)
  }
}
