export type Address = `0x${string}`

export const WEBLOCK_FUJI_DEPLOYMENT = {
  chainId: 43113,
  network: 'fuji',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorerBaseUrl: 'https://testnet.snowtrace.io',

  treasury: '0x04d974094Ac7BE61e1cf9ED9eaD858090D742Ef8' as Address,

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
    USDC: {
      address: '0xfdA453E5d63E3FF663fbF300713C6838c6dD78cf' as Address,
      decimals: 6,
      symbol: 'USDC',
    },
    WFT: {
      address: '0x64529efA2bF566794d051f7531B53EE9413E7794' as Address,
      decimals: 18,
      symbol: 'WFT',
    },
  },

  contracts: {
    rwa: {
      asset: '0x6CAF9C4cD4C0928C62c273ed7F2F3B9f3bbfa500' as Address,
      saleEscrow: '0xA2Dd7CD5C29Ac79A2c2cd253ED3e3BE474f314D2' as Address,
      interestVault: '0x6a2cfAF9D931c57FD49970b5e8d852442040b6f2' as Address,
      redemptionVault: '0xD67B733c75c67177074e41506dFF0dC509EBF02B' as Address,
    },
    product1: {
      productId: 1n,
      offeringId: 1n,
      seriesId: 1n,
      rbtAsset: '0x6CAF9C4cD4C0928C62c273ed7F2F3B9f3bbfa500' as Address,
      saleEscrow: '0xA2Dd7CD5C29Ac79A2c2cd253ED3e3BE474f314D2' as Address,
      interestVault: '0x6a2cfAF9D931c57FD49970b5e8d852442040b6f2' as Address,
      redemptionVault: '0xD67B733c75c67177074e41506dFF0dC509EBF02B' as Address,
      unitPriceUsdt: 1000000n,
      unitPriceUsdc: 1000000n,
      paymentTokens: [
        '0x4CcEF90D730AB83366a3936FA301536649E105Ed' as Address,
        '0xfdA453E5d63E3FF663fbF300713C6838c6dD78cf' as Address,
      ],
    },
  },
} as const

export type WeblockFujiDeployment = typeof WEBLOCK_FUJI_DEPLOYMENT
