// ---------------------------------------------------------------------------
// LEGACY ABIs – target the old Fuji testnet deployment (pre weblock-token v2).
// The weblock-token v2 architecture replaces these contracts:
//
//   OLD                              NEW (weblock-token source of truth)
//   ───────────────────────────────────────────────────────────────────
//   SaleRouter.buy(offeringId,       RBTSeriesManager.buy(tokenId,
//     units, maxCost)                  paymentToken, quantity,
//                                      maxCost, beneficiary)
//   SaleRouter.offerings(offeringId) RBTSeriesManager.getSeries(tokenId)
//   RBTAsset.claim(tokenId)          RBTSeriesManager.claimInterest(tokenId,
//                                      paymentToken)
//   RBTAsset.claimable(tokenId,      RBTSeriesManager.quotePrimarySale /
//     account)                         interest accounting on manager
//
// TODO(v2): replace these ABIs with the ones exported by
//   weblock-token/scripts/export-abis.js after the v2 contracts are deployed.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// V2 ABIs – target the weblock-token v2 RBTSeriesManager architecture.
// Source of truth: weblock-token/abis/RBTSeriesManager.json and
//                  weblock-token/abis/RealEstateBackedToken.json
// ---------------------------------------------------------------------------

/**
 * Core functions on RBTSeriesManager (v2).
 *
 * buy(tokenId, paymentToken, quantity, maxCost, beneficiary)
 *   – replaces SaleRouter.buy(offeringId, units, maxCost)
 *
 * getSeries(tokenId) → Series struct
 *   – replaces SaleRouter.offerings(offeringId)
 *
 * claimInterest(tokenId, paymentToken)
 *   – replaces RBTAsset.claim(tokenId)
 *
 * quotePrimarySale(tokenId, paymentToken, quantity) → uint256 cost
 *   – new helper for price calculation
 *
 * seriesPaymentTokens(tokenId) → address[]
 *   – list of accepted payment tokens for a series
 *
 * pendingInterest(account, tokenId, paymentToken) → uint256
 *   – replaces RBTAsset.claimable(tokenId, account)
 *
 * redeem(tokenId, paymentToken, quantity)
 *   – new: redeem RBT for principal after maturity
 */
export const RBT_SERIES_MANAGER_ABI = [
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
      { name: 'quantity', type: 'uint256' },
      { name: 'maxCost', type: 'uint256' },
      { name: 'beneficiary', type: 'address' },
    ],
    name: 'buy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getSeries',
    outputs: [
      {
        components: [
          { name: 'exists', type: 'bool' },
          { name: 'saleStart', type: 'uint64' },
          { name: 'saleEnd', type: 'uint64' },
          { name: 'maturityDate', type: 'uint64' },
          { name: 'activatedAt', type: 'uint64' },
          { name: 'maxSupply', type: 'uint128' },
          { name: 'soldSupply', type: 'uint128' },
          { name: 'issuerTreasury', type: 'address' },
          { name: 'secondaryTradingEnabled', type: 'bool' },
          { name: 'state', type: 'uint8' },
          { name: 'propertyCode', type: 'string' },
          { name: 'propertyName', type: 'string' },
          { name: 'roundLabel', type: 'string' },
          { name: 'metadataURI', type: 'string' },
          { name: 'cancellationMemo', type: 'string' },
          { name: 'delinquencyMemo', type: 'string' },
          { name: 'defaultMemo', type: 'string' },
        ],
        internalType: 'struct RBTSeriesManager.Series',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
    ],
    name: 'claimInterest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
      { name: 'quantity', type: 'uint256' },
    ],
    name: 'quotePrimarySale',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'seriesPaymentTokens',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '', type: 'address' },
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    name: 'pendingInterest',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
      { name: 'quantity', type: 'uint256' },
    ],
    name: 'redeem',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

/**
 * Minimal RealEstateBackedToken (ERC-1155) ABI (v2).
 * Use for balanceOf queries; all lifecycle operations go through RBTSeriesManager.
 */
export const REAL_ESTATE_BACKED_TOKEN_ABI = [
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ---------------------------------------------------------------------------
// LEGACY ABIs (v1) – kept for backward compatibility during migration.
// ---------------------------------------------------------------------------

export const RBT_PRIMARY_SALE_ROUTER_ABI = [
  {
    inputs: [{ name: 'offeringId', type: 'uint256' }],
    name: 'offerings',
    outputs: [
      { name: 'asset', type: 'address' },
      { name: 'seriesId', type: 'uint256' },
      // ✅ InvestRouter 확장 필드: 결제 토큰 주소 (USDR/USDT)
      // 구버전 Router에는 없을 수 있으므로 decode 쪽에서 방어함.
      { name: 'paymentToken', type: 'address' },
      { name: 'unitPrice', type: 'uint256' },
      { name: 'remainingUnits', type: 'uint256' },
      { name: 'startAt', type: 'uint64' },
      { name: 'endAt', type: 'uint64' },
      { name: 'treasury', type: 'address' },
      { name: 'enabled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'offeringId', type: 'uint256' },
      { name: 'units', type: 'uint256' },
      { name: 'maxCost', type: 'uint256' },
    ],
    name: 'buy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const RBT_PROPERTY_TOKEN_ABI = [
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'account', type: 'address' },
    ],
    name: 'claimable',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
