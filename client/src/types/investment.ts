export interface GetOfferingParams {
  networkId: string
  saleRouterAddress: string
  offeringId: bigint | number | string
}

export interface OfferingView {
  asset: string
  seriesId: bigint
  unitPrice: bigint
  remainingUnits: bigint
  startAt: bigint
  endAt: bigint
  treasury: string
  enabled: boolean
}

export interface InvestRbtParams {
  networkId: string
  usdrAddress: string
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
