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
  43114: {
    chainId: 43114,
    currencySymbol: 'AVAX',
    currencyName: 'Avalanche',
    currencyDecimals: 18,
    explorerUrl: 'https://snowtrace.io',
    isTestnet: false,
  },
  43113: {
    chainId: 43113,
    currencySymbol: 'AVAX',
    currencyName: 'Avalanche Fuji',
    currencyDecimals: 18,
    explorerUrl: 'https://testnet.snowtrace.io',
    isTestnet: true,
  },
}

export const DEFAULT_NETWORK_PARAMS: BlockchainRequest = {
  name: '', // required
  rpcUrl: '', // required
  chainId: 0, // required
  currencySymbol: '',
  currencyName: '',
  currencyDecimals: 18,
  explorerUrl: '',
  isTestnet: false,
}

export function getNetworkSymbol(chainId: number): string {
  return KNOWN_NETWORKS[chainId]?.currencySymbol ?? 'Unknown'
}

export function getExplorerUrl(chainId: number): string {
  return KNOWN_NETWORKS[chainId]?.explorerUrl ?? ''
}
