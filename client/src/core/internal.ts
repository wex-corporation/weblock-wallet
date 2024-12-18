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

export class InternalCoreImpl implements InternalCore {
  private readonly authService: AuthService
  private readonly walletService: WalletService
  private readonly networkService: NetworkService
  constructor(private readonly options: SDKOptions) {
    const httpClient = new HttpClient(options)
    const firebase = new FirebaseAuth(options)
    const userClient = new UserClient(httpClient)
    const walletClient = new WalletClient(httpClient)

    this.authService = new AuthService(
      firebase,
      userClient,
      walletClient,
      options.orgHost
    )
    this.walletService = new WalletService(walletClient, options.orgHost)
    this.networkService = new NetworkService(userClient, options.orgHost)
  }

  auth = {
    signIn: async (provider: string) => {
      const result = await this.authService.signIn(provider)
      return {
        isNewUser: result.isNewUser,
        email: result.email,
        photoURL: result.photoURL,
        status: result.status,
      }
    },
    signOut: () => this.authService.signOut(),
    clearNewUserFlag: () => this.authService.clearNewUserFlag(),
    isLoggedIn: () => this.authService.isLoggedIn(),
    getAuthInfo: () => this.authService.getAuthInfo(),
  }

  wallet = {
    getInfo: () => this.walletService.getInfo(),
    create: (password: string) => this.walletService.create(password),
    retrieveWallet: (password: string) =>
      this.walletService.retrieveWallet(password),
  }

  network = {
    getRegisteredNetworks: () => {
      return this.networkService.getRegisteredNetworks()
    },

    getCurrentNetwork: () => {
      return this.networkService.getCurrentNetwork()
    },

    registerNetwork: (params: BlockchainRequest) => {
      return this.networkService.registerNetwork(params)
    },

    switchNetwork: (networkId: string) => {
      return this.networkService.switchNetwork(networkId)
    },
  }
}
