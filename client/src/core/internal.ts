import { SDKOptions } from '../types'
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

export class InternalCoreImpl implements InternalCore {
  private readonly authService: AuthService
  private readonly walletService: WalletService
  private readonly networkService: NetworkService

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
    this.walletService = new WalletService(
      walletClient,
      rpcClient,
      options.orgHost
    )
    this.networkService = new NetworkService(userClient, options.orgHost)
  }

  auth = {
    signIn: (provider: string) => this.authService.signIn(provider),
    signOut: () => this.authService.signOut(),
    isLoggedIn: () => this.authService.isLoggedIn(),
    getAuthInfo: () => this.authService.getAuthInfo(),
    clearNewUserFlag: () => this.authService.clearNewUserFlag(),
  }

  wallet = {
    getInfo: () => this.walletService.getInfo(),
    create: (password: string) => this.walletService.create(password),
    retrieveWallet: (password: string) =>
      this.walletService.retrieveWallet(password),
    getBalance: (address: string, chainId: number) =>
      this.walletService.getBalance(address, chainId),
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
  }

  network = {
    getRegisteredNetworks: () => this.networkService.getRegisteredNetworks(),
    registerNetwork: (params: BlockchainRequest) =>
      this.networkService.registerNetwork(params),
    switchNetwork: (networkId: string) =>
      this.networkService.switchNetwork(networkId),
    getCurrentNetwork: () => this.networkService.getCurrentNetwork(),
  }
}
