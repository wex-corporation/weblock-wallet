// client/src/config/weblockFujiDeployment.ts
// Fuji(43113) WeBlock deployment addresses (2026-01-18)
//
// NOTE: These addresses point to legacy testnet contracts deployed before the
// weblock-token v2 rewrite. They are retained here for reference.
//
// IMPORTANT – contract architecture differences vs weblock-token (source of truth):
//   - Old: single "SaleRouter" with offeringId-based buy(offeringId, units, maxCost)
//   - New: RBTSeriesManager with buy(tokenId, paymentToken, quantity, maxCost, beneficiary)
//   - Old: interest claimed via claim(tokenId) on the RBT asset contract
//   - New: interest claimed via claimInterest(tokenId, paymentToken) on RBTSeriesManager
//   - Old: USDR deployed with 18 decimals (unitPriceWei = 1e18 = 1 USDR)
//   - New: USDR uses 6 decimals  (unitPriceWei = 1e6  = 1 USDR) – matches USDT pattern
//
// When the v2 contracts are deployed, update this file to the new addresses and
// adjust unitPriceWei / token decimals accordingly.

export type Address = `0x${string}`

export const WEBLOCK_FUJI_DEPLOYMENT = {
  chainId: 43113,
  network: 'fuji',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorerBaseUrl: 'https://testnet.snowtrace.io',

  treasury: '0x67394081091BDE902b38774076a332240Aa14b27' as Address,

  tokens: {
    // Legacy Fuji USDR was deployed with 18 decimals.
    // The weblock-token v2 USDRToken contract uses 6 decimals – update when redeployed.
    USDR: {
      address: '0xbc3A31c1788624E5bFf69cdC3a1E7405A01C6De2' as Address,
      decimals: 18, // TODO(v2): change to 6 once new contract is deployed
      symbol: 'USDR',
    },
    USDT: {
      address: '0x4CcEF90D730AB83366a3936FA301536649E105Ed' as Address,
      decimals: 6,
      symbol: 'USDT',
    },
    WFT: {
      address: '0x64529efA2bF566794d051f7531B53EE9413E7794' as Address,
      decimals: 18,
      symbol: 'WFT',
    },
  },

  contracts: {
    // Legacy contracts – not compatible with weblock-token v2 ABIs.
    // TODO(v2): replace rbtFactory + investRouter with rbtSeriesManager, interestRouter,
    //           redemptionRouter, and rbtOrderBook from the new deployment manifest.
    rbtFactory: '0x6bF159f474094915805c9768c533c6c24737F8a3' as Address,
    investRouter: '0x41c1EeD232D29FCc19c09b0e26A70e4B8c9b34e6' as Address,
    product1: {
      offeringId: 1n,
      seriesId: 1n,
      rbtAsset: '0x6173a35cBB99B82c51c6A0e0265C06B7955Eb017' as Address,
      // Legacy: 1 USDR at 18 decimals. After v2 redeployment: 1_000_000n (6 dec).
      unitPriceWei: 1000000000000000000n,
      paymentToken: '0xbc3A31c1788624E5bFf69cdC3a1E7405A01C6De2' as Address, // USDR
    },
  },
} as const

export type WeblockFujiDeployment = typeof WEBLOCK_FUJI_DEPLOYMENT

export type WeblockFujiDeployment = typeof WEBLOCK_FUJI_DEPLOYMENT
