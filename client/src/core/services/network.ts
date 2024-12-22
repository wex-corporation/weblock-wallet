import { LocalForage } from '../../utils/storage'
import { UserClient } from '../../clients/api/users'
import { NetworkInfo, SDKError, SDKErrorCode } from '../../types'
import { BlockchainRequest } from '@/clients/types'

export class NetworkService {
  constructor(
    private readonly userClient: UserClient,
    private readonly orgHost: string
  ) {}

  async getRegisteredNetworks(): Promise<NetworkInfo[]> {
    try {
      const networks = await this.userClient.getRegisteredBlockchains()
      return networks.map((network) => ({
        id: network.id,
        name: network.name,
        rpcUrl: network.rpcUrl,
        chainId: network.chainId,
        isTestnet: network.isTestnet,
        symbol: network.currencySymbol || '',
        explorerUrl: network.explorerUrl || '',
        decimals: network.currencyDecimals || 18,
      }))
    } catch (error) {
      if (error instanceof SDKError) throw error
      throw new SDKError('Failed to get networks', SDKErrorCode.NETWORK_ERROR)
    }
  }

  async getCurrentNetwork(): Promise<NetworkInfo | null> {
    const networkId = await LocalForage.get<string>(
      `${this.orgHost}:currentNetwork`
    )
    if (!networkId) return null

    const networks = await this.getRegisteredNetworks()
    return networks.find((n) => n.id === networkId) ?? null
  }

  async registerNetwork(params: BlockchainRequest): Promise<void> {
    try {
      await this.userClient.registerBlockchain(params)
    } catch (error) {
      if (error instanceof SDKError) throw error
      throw new SDKError(
        'Failed to register network',
        SDKErrorCode.NETWORK_ERROR
      )
    }
  }

  async switchNetwork(networkId: string): Promise<void> {
    try {
      const networks = await this.getRegisteredNetworks()
      const network = networks.find((n) => n.id === networkId)
      if (!network) {
        throw new SDKError('Network not found', SDKErrorCode.INVALID_NETWORK)
      }

      await LocalForage.save(`${this.orgHost}:currentNetwork`, networkId)
    } catch (error) {
      if (error instanceof SDKError) throw error
      throw new SDKError('Failed to switch network', SDKErrorCode.NETWORK_ERROR)
    }
  }

  /**
   * 현재 네트워크 초기화
   */
  async clearCurrentNetwork(): Promise<void> {
    try {
      await LocalForage.delete(`${this.orgHost}:currentNetwork`)
      console.log('Current network cleared')
    } catch (error) {
      console.error('Error clearing current network:', error)
      throw new SDKError(
        'Failed to clear current network',
        SDKErrorCode.NETWORK_ERROR,
        error
      )
    }
  }
}
