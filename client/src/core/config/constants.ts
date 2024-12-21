import { BlockchainRequest } from '@/clients/types'

export const KNOWN_NETWORKS: Record<number, Partial<BlockchainRequest>> = {
  1: {
    chainId: 1,
    currencySymbol: 'ETH',
    currencyName: 'Ethereum',
    currencyDecimals: 18,
    explorerUrl: 'https://etherscan.io',
    isTestnet: false,
  },
  137: {
    chainId: 137,
    currencySymbol: 'MATIC',
    currencyName: 'Polygon',
    currencyDecimals: 18,
    explorerUrl: 'https://polygonscan.com',
    isTestnet: false,
  },
}

export const DEFAULT_NETWORK_PARAMS: Partial<BlockchainRequest> = {
  currencyDecimals: 18,
  isTestnet: false,
  currencySymbol: '',
  currencyName: '',
  explorerUrl: '',
}
