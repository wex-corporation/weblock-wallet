// client/src/config/weblockFujiDeployment.ts
// Fuji(43113) WeBlock v2 deployment addresses (2026-03-16)
//
// Source of truth: the weblock-token (weblock-tokenomics) repository deployment manifests.
// Deployment wallet: 0x04d974094Ac7BE61e1cf9ED9eaD858090D742Ef8

export type Address = `0x${string}`

export const WEBLOCK_FUJI_DEPLOYMENT = {
  chainId: 43113,
  network: 'fuji',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorerBaseUrl: 'https://testnet.snowtrace.io',

  treasury: '0x04d974094Ac7BE61e1cf9ED9eaD858090D742Ef8' as Address,

  tokens: {
    USDR: {
      address: '0xe3BE8AD4b1fB74AC96FAb68064eccBB4b2C17361' as Address,
      decimals: 6,
      symbol: 'USDR',
    },
    USDT: {
      address: '0xe8347D24f35B0c819e0E5e254e879Af7820e1f41' as Address,
      decimals: 6,
      symbol: 'USDT',
    },
    USDC: {
      address: '0xdD263AbD857dfadbb6Cb67F5208620D6827AC61c' as Address,
      decimals: 6,
      symbol: 'USDC',
    },
    WFT: {
      address: '0xBC63d49b8577475db7e945B533Da131c9F09c111' as Address,
      decimals: 18,
      symbol: 'WFT',
    },
  },

  contracts: {
    rbt: '0x58Fd2567b447D349Ecc373aca061B886916FC929' as Address,
    rbtSeriesManager: '0x27e53457af652db3AF7d91875f127F7281B090df' as Address,
    interestRouter: '0x8930FFBe00C6A040994fD52b18876e8C64110ED5' as Address,
    redemptionRouter: '0x0F75830129146a0f76b71Fc454c71C999d54bB64' as Address,
    rbtOrderBook: '0xfC403ab9D123F150e5241a3688Ee334B91FdB46D' as Address,

    // Compatibility block for code paths that still expect a product config.
    // tokenId/unitPriceWei should be updated after create-series.js is run.
    product1: {
      tokenId: 1n,
      seriesId: 1n,
      rbtAsset: '0x58Fd2567b447D349Ecc373aca061B886916FC929' as Address,
      unitPriceWei: 1000000n,
      paymentToken: '0xe3BE8AD4b1fB74AC96FAb68064eccBB4b2C17361' as Address, // USDR (6 decimals)
    },
  },
} as const

export type WeblockFujiDeployment = typeof WEBLOCK_FUJI_DEPLOYMENT
