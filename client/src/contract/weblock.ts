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
