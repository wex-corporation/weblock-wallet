import { AddNetworkRequest, NetworkInfo, SDKOptions } from '../types'
import { InternalCore } from '../core/types'
import { KNOWN_NETWORKS, DEFAULT_NETWORK_PARAMS } from '../utils/network'
import { BlockchainRequest } from '@/clients/types'

export class NetworkModule {
  constructor(
    private readonly options: SDKOptions,
    private readonly core: InternalCore
  ) {}

  async getAvailableNetworks(): Promise<NetworkInfo[]> {
    return this.core.network.getRegisteredNetworks()
  }

  async getCurrentNetwork(): Promise<NetworkInfo | null> {
    return this.core.network.getCurrentNetwork()
  }

  async addNetwork(request: AddNetworkRequest): Promise<void> {
    const knownDefaults =
      KNOWN_NETWORKS[request.chainId] ?? DEFAULT_NETWORK_PARAMS

    const params: BlockchainRequest = {
      ...DEFAULT_NETWORK_PARAMS,
      ...knownDefaults,
      name: request.name,
      rpcUrl: request.rpcUrl,
      chainId: request.chainId,
    }

    await this.core.network.registerNetwork(params)
  }

  async switchNetwork(networkId: string): Promise<void> {
    await this.core.network.switchNetwork(networkId)
  }
}
