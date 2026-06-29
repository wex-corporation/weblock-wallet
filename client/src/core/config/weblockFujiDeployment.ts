// client/src/core/config/weblockFujiDeployment.ts
// Fuji(43113) WeBlock GREENFIELD deployment addresses (2026-06-30)
//
// Source of truth: weblock-token (weblock-tokenomics) repo, deployments/fuji.json.
// Deployment wallet / admin / treasury / operator: 0xC4C47A2373418E210CE171bfb389FC8d2Dfe6229
// USDT/USDC are mock stablecoins (testnet); all stablecoins use 6 decimals.
//
// Greenfield architecture: SpotExchange (EIP-712 off-chain matched) replaces the on-chain
// order book; IncomeDistributor (Merkle) is the single rent path (no interest/redemption routers);
// KycRegistry gates RBT secondary transfers; WBP stays off-chain (no token here).

export type Address = `0x${string}`

export const WEBLOCK_FUJI_DEPLOYMENT = {
  chainId: 43113,
  network: 'fuji',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorerBaseUrl: 'https://testnet.snowtrace.io',

  treasury: '0xC4C47A2373418E210CE171bfb389FC8d2Dfe6229' as Address,
  operator: '0xC4C47A2373418E210CE171bfb389FC8d2Dfe6229' as Address,

  tokens: {
    USDR: {
      address: '0x339995DdB41166cC20fd4e82E2817b4ddBE16Be4' as Address,
      decimals: 6,
      symbol: 'USDR',
    },
    USDT: {
      address: '0xFF90e9A716E31990ddF5bA80C861E18b4498E140' as Address,
      decimals: 6,
      symbol: 'USDT',
    },
    USDC: {
      address: '0x6Ad718292eD110513bEFC459A74f37bBE6D59862' as Address,
      decimals: 6,
      symbol: 'USDC',
    },
    WFT: {
      address: '0xadb62479E9d2914d1f1eB743Af9Ea69b9481933b' as Address,
      decimals: 18,
      symbol: 'WFT',
    },
  },

  contracts: {
    rbt: '0x9F9A517E7d56d8F986fAc361896891f79E4E7f77' as Address,
    kycRegistry: '0x08F176f989CBe45FAf0240F9C449dF6f14E7EC7D' as Address,
    seriesManager: '0xf3DBB781b5366255C58F25837Afb282D2257a55F' as Address,
    incomeDistributor: '0x9212525570eD0800899262B5b19EDC5da74ADcFC' as Address,
    spotExchange: '0x217C187ec99e1EcaBD80386403127A86D23340e0' as Address,
    navOracle: '0x078A5A64504d329a92701B3E2b86B57a62351013' as Address,
    insuranceFund: '0x94c26d6c06783e3A59b8844529715479eD58f685' as Address,
    perpClearing: '0x67a55155E61Ca2932Ac1b4Ad1B62CdeA16CF1f3c' as Address,
    wftClaim: '0x3ff6A045D2aaED025D558e7Cf3b8fFa0fa10681c' as Address,

    // Launch product (seeded on-chain): series #1 "Prime Retail Tower", sale open.
    // Price 10 USDC per RBT (6dp). KYC required to buy/transfer.
    product1: {
      tokenId: 1n,
      seriesId: 1n,
      rbtAsset: '0x9F9A517E7d56d8F986fAc361896891f79E4E7f77' as Address,
      unitPriceWei: 10000000n, // 10 USDC (6 decimals)
      paymentToken: '0x6Ad718292eD110513bEFC459A74f37bBE6D59862' as Address, // USDC (6 decimals)
    },
  },

  // EIP-712 domains for signing spot/perp orders (match the contracts exactly).
  eip712: {
    spot: { name: 'WeBlockSpot', version: '1' },
    perp: { name: 'WeBlockPerp', version: '1' },
  },
} as const

export type WeblockFujiDeployment = typeof WEBLOCK_FUJI_DEPLOYMENT
