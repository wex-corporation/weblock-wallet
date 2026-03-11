export interface GetOfferingParams {
  networkId: string
  saleRouterAddress: string
  offeringId: bigint | number | string
}

export interface OfferingView {
  asset: string
  seriesId: bigint
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
  usdrAddress?: string
  saleRouterAddress: string
  offeringId: bigint | number | string
  units: bigint | number | string
  maxCostWei?: string
  autoApprove?: boolean
  approveMax?: boolean
  waitForApprovalReceipt?: boolean
  gasLimitApprove?: string
  gasLimitBuy?: string
}

export interface InvestRbtResult {
  offering: OfferingView
  costWei: string
  approvalTxxHash?: string
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

export interface PaymentOptionView {
  tokenAddress: string
  enabled: boolean
  known: boolean
  unitPrice: bigint
  escrowedAmount: bigint
  releasedAmount: bigint
}

export interface RwaOfferingView {
  asset: string
  productId: bigint
  targetUnits: bigint
  unitsSold: bigint
  remainingUnits: bigint
  saleStart: bigint
  saleEnd: bigint
  treasury: string
  status: number
  enabled: boolean
  paymentOption?: PaymentOptionView
}

export interface GetRwaOfferingParams {
  networkId: string
  saleEscrowAddress: string
  productId: bigint | number | string
  paymentTokenAddress?: string
}

export interface BuyRwaProductParams {
  networkId: string
  saleEscrowAddress: string
  productId: bigint | number | string
  paymentTokenAddress: string
  units: bigint | number | string
  maxCostWei?: string
  autoApprove?: boolean
  approveMax?: boolean
  waitForApprovalReceipt?: boolean
  gasLimitApprove?: string
  gasLimitBuy?: string
}

export interface BuyRwaProductResult {
  offering: RwaOfferingView
  costWei: string
  approvalTxHash?: string
  purchaseTxHash: string
}

export interface ClaimRwaInterestParams {
  networkId: string
  interestVaultAddress: string
  productId: bigint | number | string
  rewardTokenAddress: string
  gasLimit?: string
}

export interface ClaimAllRwaInterestParams {
  networkId: string
  interestVaultAddress: string
  productId: bigint | number | string
  gasLimit?: string
}

export interface ClaimRwaInterestResult {
  txHash: string
}

export interface GetClaimableRwaInterestParams {
  networkId: string
  interestVaultAddress: string
  productId: bigint | number | string
  rewardTokenAddress: string
  account?: string
}

export interface GetRwaBalanceParams {
  networkId: string
  assetAddress: string
  productId: bigint | number | string
  account?: string
}

export interface RedeemRwaParams {
  networkId: string
  redemptionVaultAddress: string
  productId: bigint | number | string
  payoutTokenAddress: string
  units: bigint | number | string
  gasLimit?: string
}

export interface RedeemRwaResult {
  txHash: string
}

export interface PreviewRedeemRwaParams {
  networkId: string
  redemptionVaultAddress: string
  productId: bigint | number | string
  payoutTokenAddress: string
  account?: string
}

export interface PreviewRedeemRwaResult {
  units: string
  payoutAmount: string
}
