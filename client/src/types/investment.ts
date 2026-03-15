// client/src/types/investment.ts
// ✅ InvestRouter(USDR/USDT) 지원을 위해 usdrAddress를 optional로 변경
// ✅ OfferingView에 paymentToken(옵션)을 추가 (Legacy Router 호환)

export interface GetOfferingParams {
  networkId: string
  saleRouterAddress: string
  offeringId: bigint | number | string
}

export interface OfferingView {
  asset: string
  seriesId: bigint

  /**
   * InvestRouter 확장 필드: 결제 토큰 주소(USDR/USDT).
   * Legacy Router에서는 존재하지 않으므로 optional.
   */
  paymentToken?: string

  unitPrice: bigint
  remainingUnits: bigint
  startAt: bigint
  endAt: bigint
  treasury: string
  enabled: boolean
}

export interface InvestRbtParams {
  networkId: string

  /**
   * (Legacy Router 호환용)
   * InvestRouter(신규)에서는 offering.paymentToken을 사용하므로 생략 가능.
   */
  usdrAddress?: string

  saleRouterAddress: string
  offeringId: bigint | number | string
  units: bigint | number | string

  /**
   * 보호용 상한(슬리피지 개념). 미지정 시 cost == maxCost로 처리.
   */
  maxCostWei?: string

  /**
   * true면 allowance 확인 후 부족 시 approve까지 자동 수행
   */
  autoApprove?: boolean

  /**
   * autoApprove일 때 approve를 MaxUint로 할지(cost만 할지)
   */
  approveMax?: boolean

  /**
   * autoApprove에서 approve tx 영수증을 기다릴지(기본 true 권장)
   */
  waitForApprovalReceipt?: boolean

  gasLimitApprove?: string
  gasLimitBuy?: string
}

export interface InvestRbtResult {
  offering: OfferingView
  costWei: string
  approvalTxxHash?: string // ⛔️ 아래 "approvalTxHash"로 통일 권장. (기존 호환이면 유지)
  approvalTxHash?: string
  purchaseTxHash: string
}

export interface ClaimRbtRevenueParams {
  networkId: string
  rbtAssetAddress: string
  seriesId: bigint | number | string
  gasLimit?: string
}

export interface ClaimRbtRevenueResult {
  txHash: string
}

// ─── weblock-token v2 (RBTSeriesManager) types ──────────────────────────────

/**
 * Series state enum matching RBTSeriesManager.SeriesState.
 *   0 = SETUP, 1 = ACTIVE, 2 = DISTRIBUTED, 3 = REDEEMED, 4 = CANCELLED
 */
export const SeriesState = {
  SETUP: 0,
  ACTIVE: 1,
  DISTRIBUTED: 2,
  REDEEMED: 3,
  CANCELLED: 4,
} as const
export type SeriesStateValue = (typeof SeriesState)[keyof typeof SeriesState]

/** Decoded view of the on-chain Series struct from RBTSeriesManager.getSeries(). */
export interface SeriesView {
  exists: boolean
  saleStart: bigint
  saleEnd: bigint
  maturityDate: bigint
  activatedAt: bigint
  maxSupply: bigint
  soldSupply: bigint
  issuerTreasury: string
  secondaryTradingEnabled: boolean
  state: SeriesStateValue
  propertyCode: string
  propertyName: string
  roundLabel: string
  metadataURI: string
  cancellationMemo: string
  delinquencyMemo: string
  defaultMemo: string
}

export interface GetSeriesParams {
  networkId: string
  rbtSeriesManagerAddress: string
  tokenId: bigint | number | string
}

export interface InvestRbtV2Params {
  networkId: string
  /** RBTSeriesManager contract address */
  rbtSeriesManagerAddress: string
  /** ERC-1155 tokenId for the series */
  tokenId: bigint | number | string
  /** Payment token address (USDR or USDT) */
  paymentToken: string
  /** Number of RBT units to buy */
  quantity: bigint | number | string
  /** Slippage guard – defaults to exact cost from quotePrimarySale */
  maxCost?: string
  /** Beneficiary address – defaults to connected wallet */
  beneficiary?: string
  autoApprove?: boolean
  approveMax?: boolean
  waitForApprovalReceipt?: boolean
  gasLimitApprove?: string
  gasLimitBuy?: string
}

export interface InvestRbtV2Result {
  series: SeriesView
  costWei: string
  approvalTxHash?: string
  purchaseTxHash: string
}

export interface ClaimInterestV2Params {
  networkId: string
  rbtSeriesManagerAddress: string
  tokenId: bigint | number | string
  paymentToken: string
  gasLimit?: string
}

export interface ClaimInterestV2Result {
  txHash: string
}

export interface RedeemRbtV2Params {
  networkId: string
  rbtSeriesManagerAddress: string
  tokenId: bigint | number | string
  paymentToken: string
  quantity: bigint | number | string
  gasLimit?: string
}

export interface RedeemRbtV2Result {
  txHash: string
}

export interface GetPendingInterestParams {
  networkId: string
  rbtSeriesManagerAddress: string
  tokenId: bigint | number | string
  paymentToken: string
  account?: string
}
