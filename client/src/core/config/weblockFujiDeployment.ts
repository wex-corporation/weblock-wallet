// client/src/config/weblockFujiDeployment.ts
// Fuji(43113) WeBlock deployment addresses (2026-01-18)

export type Address = `0x${string}`

export const WEBLOCK_FUJI_DEPLOYMENT = {
  chainId: 43113,
  network: 'fuji',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorerBaseUrl: 'https://testnet.snowtrace.io',

  treasury: '0x67394081091BDE902b38774076a332240Aa14b27' as Address,

  tokens: {
    USDR: {
      address: '0xbc3A31c1788624E5bFf69cdC3a1E7405A01C6De2' as Address,
      decimals: 18,
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
    rbtFactory: '0x6bF159f474094915805c9768c533c6c24737F8a3' as Address,
    investRouter: '0x41c1EeD232D29FCc19c09b0e26A70e4B8c9b34e6' as Address,
    product1: {
      offeringId: 1n,
      seriesId: 1n,
      rbtAsset: '0x6173a35cBB99B82c51c6A0e0265C06B7955Eb017' as Address,
      unitPriceWei: 1000000000000000000n, // 1 USDR
      paymentToken: '0xbc3A31c1788624E5bFf69cdC3a1E7405A01C6De2' as Address, // USDR
    },
  },
} as const

export type WeblockFujiDeployment = typeof WEBLOCK_FUJI_DEPLOYMENT
