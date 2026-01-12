import {
  SDKOptions,
  WalletInfo,
  SignInResponse,
  WalletResponse,
  TransferRequest,
  TransferResponse,
  AddNetworkRequest,
  Transaction,
  TokenBalance,
  TokenInfo,
  TokenInfoParams,
  TokenBalanceParams,
  TokenApprovalParams,
  TokenAllowanceParams,
  ERC1155BalanceParams,
  RbtClaimableParams,
  RbtClaimParams,
} from './types'
import { Core } from './core'
import { UserModule, WalletModule, AssetModule } from './modules'
import { SDKError, SDKErrorCode } from './types/error'
import { NetworkModule } from './modules/network'
import { TokenMetadata } from './core/services/asset'

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
    this.walletModule = new WalletModule(options, internalCore)
    this.userModule = new UserModule(options, internalCore, this.walletModule)
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

    /**
     * ✅ 추가: PIN reset API 노출
     */
    resetPin: async (newPassword: string): Promise<WalletResponse> => {
      return this.userModule.resetPin(newPassword)
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
      callback: (tx: Transaction | undefined) => void
    ): (() => void) => {
      return this.walletModule.onTransactionUpdate(callback)
    },
    getBalance: (address: string, chainId: number): Promise<TokenBalance> => {
      return this.walletModule.getBalance(address, chainId)
    },
    getTransactionCount: (
      address: string,
      chainId: number
    ): Promise<number> => {
      return this.walletModule.getTransactionCount(address, chainId)
    },
    getBlockNumber: (chainId: number): Promise<number> => {
      return this.walletModule.getBlockNumber(chainId)
    },
    sendRawTransaction: (
      signedTx: string,
      chainId: number
    ): Promise<string> => {
      return this.walletModule.sendRawTransaction(signedTx, chainId)
    },
    getTransactionReceipt: (txHash: string, chainId: number): Promise<any> => {
      return this.walletModule.getTransactionReceipt(txHash, chainId)
    },
    getTransaction: (txHash: string, chainId: number): Promise<any> => {
      return this.walletModule.getTransaction(txHash, chainId)
    },
    estimateGas: (txParams: any, chainId: number): Promise<number> => {
      return this.walletModule.estimateGas(txParams, chainId)
    },
    getGasPrice: (chainId: number): Promise<string> => {
      return this.walletModule.getGasPrice(chainId)
    },
    call: (
      txParams: any,
      blockParam: string | number,
      chainId: number
    ): Promise<string> => {
      return this.walletModule.call(txParams, blockParam, chainId)
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

    on: (event: string, listener: (...args: any[]) => void): void => {
      this.assetModule.on(event, listener)
    },
    off: (event: string, listener: (...args: any[]) => void): void => {
      this.assetModule.off(event, listener)
    },

    getTokenInfo: async (params: TokenInfoParams): Promise<TokenMetadata> => {
      return this.assetModule.getTokenInfo(params)
    },

    // ERC20 helpers
    getTokenBalance: async (params: TokenBalanceParams): Promise<string> => {
      this.ensureInitialized()
      return this.assetModule.getTokenBalance(params)
    },

    approveToken: async (params: TokenApprovalParams): Promise<string> => {
      this.ensureInitialized()
      return this.assetModule.approveToken(params)
    },

    getAllowance: async (params: TokenAllowanceParams): Promise<string> => {
      this.ensureInitialized()
      return this.assetModule.getAllowance(params)
    },

    // ERC1155 / RBT helpers
    getERC1155Balance: async (
      params: ERC1155BalanceParams
    ): Promise<string> => {
      this.ensureInitialized()
      return this.assetModule.getERC1155Balance(params)
    },

    getRbtClaimable: async (params: RbtClaimableParams): Promise<string> => {
      this.ensureInitialized()
      return this.assetModule.getRbtClaimable(params)
    },

    claimRbt: async (params: RbtClaimParams): Promise<string> => {
      this.ensureInitialized()
      return this.assetModule.claimRbt(params)
    },

    registerToken: async (params: {
      networkId: string
      tokenAddress: string
    }): Promise<void> => {
      return this.assetModule.registerToken(params)
    },

    getTokenFullInfo: async (params: {
      networkId: string
      tokenAddress: string
      walletAddress: string
    }): Promise<TokenInfo> => {
      return this.assetModule.getTokenFullInfo(params)
    },
  }
}

export default WeBlockSDK
export * from './types'
export { TokenAmount, DECIMALS } from './utils/numbers'
export type { TokenBalance } from './types'
export type { TokenMetadata } from './core/services/asset'
