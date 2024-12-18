import {
  SDKOptions,
  WalletInfo,
  NetworkInfo,
  SignInResponse,
  WalletResponse,
  SwitchNetworkResponse,
  TransferRequest,
  TransferResponse,
  AddNetworkRequest,
} from './types'
import { Core } from './core'
import { UserModule, WalletModule, AssetModule } from './modules'
import { SDKError, SDKErrorCode } from './types/error'
import { NetworkModule } from './modules/network'

/**
 * WeBlock Wallet SDK
 * 논커스토디얼 웹3 지갑 SDK
 */
export class WeBlockSDK {
  private readonly core: Core
  private readonly userModule: UserModule
  private readonly walletModule: WalletModule
  private readonly assetModule: AssetModule
  private readonly networkModule: NetworkModule
  private initialized = false

  constructor(options: SDKOptions) {
    this.validateOptions(options)
    this.core = new Core(options)

    const internalCore = this.core.getInternalCore()
    this.userModule = new UserModule(options, internalCore)
    this.walletModule = new WalletModule(options, internalCore)
    this.assetModule = new AssetModule(options, internalCore)
    this.networkModule = new NetworkModule(options, internalCore)
    this.initialized = true
    console.info('WeBlock SDK initialized successfully')
  }

  private validateOptions(options: SDKOptions): void {
    const { environment, apiKey, orgHost } = options

    if (!['local', 'dev', 'stage', 'prod'].includes(environment)) {
      throw new SDKError('Invalid environment', SDKErrorCode.INVALID_CONFIG)
    }
    if (!apiKey)
      throw new SDKError('API key is required', SDKErrorCode.INVALID_CONFIG)
    if (!orgHost)
      throw new SDKError(
        'Organization host is required',
        SDKErrorCode.INVALID_CONFIG
      )
  }

  private ensureInitialized() {
    if (!this.initialized) {
      throw new SDKError('SDK is not initialized', SDKErrorCode.NOT_INITIALIZED)
    }
  }

  public isInitialized(): boolean {
    return this.initialized
  }

  public readonly user = {
    signIn: async (provider: 'google.com'): Promise<SignInResponse> => {
      return this.userModule.signIn(provider)
    },

    createWallet: async (password: string): Promise<WalletResponse> => {
      return this.userModule.createWallet(password)
    },

    retrieveWallet: async (password: string): Promise<WalletResponse> => {
      return this.userModule.retrieveWallet(password)
    },

    signOut: async (): Promise<void> => {
      return this.userModule.signOut()
    },
  }

  public readonly wallet = {
    getInfo: async (): Promise<WalletInfo> => {
      return this.walletModule.getInfo()
    },
    onWalletUpdate: (callback: (wallet: WalletInfo) => void): (() => void) => {
      return this.walletModule.onWalletUpdate(callback)
    },
    onTransactionUpdate: (
      callback: (tx: WalletInfo['recentTransactions'][0]) => void
    ): (() => void) => {
      return this.walletModule.onTransactionUpdate(callback)
    },
  }

  public readonly network = {
    getAvailableNetworks: () => this.networkModule.getAvailableNetworks(),
    addNetwork: (request: AddNetworkRequest) =>
      this.networkModule.addNetwork(request),
    switchNetwork: (networkId: string) =>
      this.networkModule.switchNetwork(networkId),
    getCurrentNetwork: () => this.networkModule.getCurrentNetwork(),
  }

  public readonly asset = {
    transfer: async (params: TransferRequest): Promise<TransferResponse> => {
      return this.assetModule.transfer(params)
    },

    addToken: async (params: {
      type: 'ERC20' | 'SECURITY'
      networkId: string
      address: string
      symbol?: string
      decimals?: number
      name?: string
    }): Promise<void> => {
      return this.assetModule.addToken(params)
    },

    addNFTCollection: async (params: {
      networkId: string
      address: string
      name?: string
    }): Promise<void> => {
      return this.assetModule.addNFTCollection(params)
    },

    checkSecurityTokenCompliance: async (params: {
      networkId: string
      tokenAddress: string
      from: string
      to: string
      amount: string
    }): Promise<{
      canTransfer: boolean
      reasons?: string[]
    }> => {
      return this.assetModule.checkSecurityTokenCompliance(params)
    },
  }
}

export default WeBlockSDK
export * from './types'
