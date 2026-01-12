import {
  SDKOptions,
  SendTransactionParams,
  TokenAllowanceParams,
  TokenApprovalParams,
  TokenBalanceParams,
  ERC1155BalanceParams,
  RbtClaimableParams,
  RbtClaimParams,
  TokenInfoParams,
  TransferRequest,
} from '../types'
import { InternalCore } from './types'
import { AuthService } from './services/auth'
import { WalletService } from './services/wallet'
import { NetworkService } from './services/network'
import { HttpClient } from '../clients/http'
import { FirebaseAuth } from './auth/firebase'
import { UserClient } from '../clients/api/users'
import { WalletClient } from '../clients/api/wallets'
import { BlockchainRequest } from '@/clients/types'
import { RpcClient } from '../clients/api/rpcs'
import { AssetService } from './services/asset'

export class InternalCoreImpl implements InternalCore {
  private readonly authService: AuthService
  private readonly walletService: WalletService
  private readonly networkService: NetworkService
  private readonly assetService: AssetService
  constructor(private readonly options: SDKOptions) {
    const httpClient = new HttpClient(options)
    const firebase = new FirebaseAuth(options)
    const userClient = new UserClient(httpClient)
    const walletClient = new WalletClient(httpClient)
    const rpcClient = new RpcClient(httpClient)

    this.authService = new AuthService(
      firebase,
      userClient,
      walletClient,
      options.orgHost
    )
    this.networkService = new NetworkService(userClient, options.orgHost)
    this.walletService = new WalletService(
      walletClient,
      rpcClient,
      options.orgHost,
      this.networkService
    )

    this.assetService = new AssetService(
      rpcClient,
      this.walletService,
      this.networkService,
      userClient,
      options.orgHost
    )
  }

  auth = {
    signIn: (provider: string) => this.authService.signIn(provider),
    signOut: () => this.authService.signOut(),
    isLoggedIn: () => this.authService.isLoggedIn(),
    getAuthInfo: () => this.authService.getAuthInfo(),
    clearNewUserFlag: () => this.authService.clearNewUserFlag(),
  }

  wallet = {
    getAddress: () => this.walletService.getAddress(),
    create: (password: string) => this.walletService.create(password),
    retrieveWallet: (password: string) =>
      this.walletService.retrieveWallet(password),
    getBalance: (address: string, chainId: number) =>
      this.walletService.getBalance(address, chainId),
    getTokenBalance: (
      tokenAddress: string,
      walletAddress: string,
      chainId: number
    ) =>
      this.walletService.getTokenBalance(tokenAddress, walletAddress, chainId),
    sendTransaction: (params: SendTransactionParams) =>
      this.walletService.sendTransaction(params),
    getTransactionCount: (address: string, chainId: number) =>
      this.walletService.getTransactionCount(address, chainId),
    getBlockNumber: (chainId: number) =>
      this.walletService.getBlockNumber(chainId),
    sendRawTransaction: (signedTx: string, chainId: number) =>
      this.walletService.sendRawTransaction(signedTx, chainId),
    getTransactionReceipt: (txHash: string, chainId: number) =>
      this.walletService.getTransactionReceipt(txHash, chainId),
    getTransaction: (txHash: string, chainId: number) =>
      this.walletService.getTransaction(txHash, chainId),
    estimateGas: (txParams: any, chainId: number) =>
      this.walletService.estimateGas(txParams, chainId),
    getGasPrice: (chainId: number) => this.walletService.getGasPrice(chainId),
    call: (txParams: any, blockParam: string | number, chainId: number) =>
      this.walletService.call(txParams, blockParam, chainId),
    getLatestTransaction: (address: string, chainId: number) =>
      this.walletService.getLatestTransaction(address, chainId),
  }

  network = {
    getRegisteredNetworks: () => this.networkService.getRegisteredNetworks(),
    registerNetwork: (params: BlockchainRequest) =>
      this.networkService.registerNetwork(params),
    switchNetwork: (networkId: string) =>
      this.networkService.switchNetwork(networkId),
    getCurrentNetwork: () => this.networkService.getCurrentNetwork(),
  }
  asset = {
    transfer: (params: TransferRequest) => this.assetService.transfer(params),

    addToken: (params: {
      type: 'ERC20' | 'SECURITY'
      networkId: string
      address: string
      symbol?: string
      decimals?: number
      name?: string
    }) => this.assetService.addToken(params),

    // New ERC20 methods
    getTokenBalance: (params: TokenBalanceParams) =>
      this.assetService.getTokenBalance(params),

    // ERC1155 / RBT helpers
    getERC1155Balance: (params: ERC1155BalanceParams) =>
      this.assetService.getERC1155Balance(params),

    getRbtClaimable: (params: RbtClaimableParams) =>
      this.assetService.getRbtClaimable(params),

    claimRbt: (params: RbtClaimParams) => this.assetService.claimRbt(params),

    approveToken: (params: TokenApprovalParams) =>
      this.assetService.approveToken(params),

    getAllowance: (params: TokenAllowanceParams) =>
      this.assetService.getAllowance(params),

    // getTokenInfo: (params: TokenInfoParams) =>
    //   this.assetService.getTokenInfo(params),
    addNFTCollection: (params: {
      networkId: string
      address: string
      name?: string
    }) => this.assetService.addNFTCollection(params),
    // checkSecurityTokenCompliance: (params: {
    //   networkId: string
    //   tokenAddress: string
    //   from: string
    //   to: string
    //   amount: string
    // }) => this.assetService.checkSecurityTokenCompliance(params),
    on: (event: string, listener: (...args: any[]) => void) =>
      this.assetService.on(event, listener),
    off: (event: string, listener: (...args: any[]) => void) =>
      this.assetService.off(event, listener),
    getTokenInfo: (params: TokenInfoParams) =>
      this.assetService.getTokenInfo(params),

    registerToken: (params: { networkId: string; tokenAddress: string }) =>
      this.assetService.registerToken(params),

    getTokenFullInfo: (params: {
      networkId: string
      tokenAddress: string
      walletAddress: string
    }) => this.assetService.getTokenFullInfo(params),

    getRegisteredCoins: (networkId: string) =>
      this.assetService.getRegisteredCoins(networkId),
  }
}
