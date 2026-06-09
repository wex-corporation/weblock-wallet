import { SDKOptions } from '../types'
import { InternalCore } from '../core/types'
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

export class InvestmentModule {
  constructor(
    private readonly options: SDKOptions,
    private readonly core: InternalCore
  ) {}

  // ─── v1 (legacy SaleRouter) methods ─────────────────────────────────────

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

  // ─── v2 (RBTSeriesManager) methods ──────────────────────────────────────

  /** Fetch on-chain series metadata from RBTSeriesManager.getSeries(). */
  getSeriesV2(params: GetSeriesParams): Promise<SeriesView> {
    return this.core.investment.getSeriesV2(params)
  }

  /** approve (if needed) + buy via RBTSeriesManager.buy(). */
  investRbtV2(params: InvestRbtV2Params): Promise<InvestRbtV2Result> {
    return this.core.investment.investRbtV2(params)
  }

  /** Claim accumulated interest via RBTSeriesManager.claimInterest(). */
  claimInterestV2(params: ClaimInterestV2Params): Promise<ClaimInterestV2Result> {
    return this.core.investment.claimInterestV2(params)
  }

  /** Redeem RBT for principal after maturity via RBTSeriesManager.redeem(). */
  redeemRbtV2(params: RedeemRbtV2Params): Promise<RedeemRbtV2Result> {
    return this.core.investment.redeemRbtV2(params)
  }

  /** Query pending (unclaimed) interest via RBTSeriesManager.pendingInterest(). */
  getPendingInterestV2(params: GetPendingInterestParams): Promise<string> {
    return this.core.investment.getPendingInterestV2(params)
  }

  on(event: string, listener: (...args: any[]) => void): void {
    this.core.investment.on(event, listener)
  }

  off(event: string, listener: (...args: any[]) => void): void {
    this.core.investment.off(event, listener)
  }
}
