// client/src/config/weblockFujiDeployment.ts
// Fuji(43113) WeBlock v2 deployment addresses (2026-06-10)
//
// Source of truth: weblock-token (weblock-tokenomics) repo, deployments/fuji.json.
// Deployment wallet / admin / treasury: 0xC4C47A2373418E210CE171bfb389FC8d2Dfe6229
// USDT/USDC are mock stablecoins (testnet); all stablecoins use 6 decimals.

export type Address = `0x${string}`

export const WEBLOCK_FUJI_DEPLOYMENT = {
  chainId: 43113,
  network: 'fuji',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorerBaseUrl: 'https://testnet.snowtrace.io',

  treasury: '0xC4C47A2373418E210CE171bfb389FC8d2Dfe6229' as Address,

  tokens: {
    USDR: {
      address: '0x4BEdd876E463de9F4b5827E318acAA33E42Fb66D' as Address,
      decimals: 6,
      symbol: 'USDR',
    },
    USDT: {
      address: '0xF5a89493D85F767Ea783858f6Fa903E587Ef3830' as Address,
      decimals: 6,
      symbol: 'USDT',
    },
    USDC: {
      address: '0xbCe6D7fB3bDb41120EAeEaEd75f10d5d8F9c1a6A' as Address,
      decimals: 6,
      symbol: 'USDC',
    },
    WFT: {
      address: '0x33980895233EC26F1DeB7061F96966aC2eB224ff' as Address,
      decimals: 18,
      symbol: 'WFT',
    },
  },

  contracts: {
    rbt: '0x91786bEFeB00163CFCBDffCA9959Eb788D5b4Fc0' as Address,
    rbtSeriesManager: '0x65Cb981A6FE0F5B489171e7725949f9299ba2a05' as Address,
    interestRouter: '0x967180893109585fc5975Ba66E1DDb0B99674aB5' as Address,
    redemptionRouter: '0x358239E22382731e62d9344dd5544b2CC0e52bD1' as Address,
    rbtOrderBook: '0x97195CA8aed94b24D4a28d7fC401F517aC180884' as Address,

    // Template product config. NOTE: no series has been created on this fresh
    // deployment yet — run weblock-token `scripts/create-series.js` (OPERATOR
    // role on rbtSeriesManager), then set tokenId/unitPriceWei to match.
    product1: {
      tokenId: 1n,
      seriesId: 1n,
      rbtAsset: '0x91786bEFeB00163CFCBDffCA9959Eb788D5b4Fc0' as Address,
      unitPriceWei: 1000000n,
      paymentToken: '0x4BEdd876E463de9F4b5827E318acAA33E42Fb66D' as Address, // USDR (6 decimals)
    },
  },
} as const

export type WeblockFujiDeployment = typeof WEBLOCK_FUJI_DEPLOYMENT
