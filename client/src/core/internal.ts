import { SDKOptions } from '../types'
import { InternalCore } from './types'
import { AuthService } from './services/auth'
import { WalletService } from './services/wallet'
import { HttpClient } from '../clients/http'
import { FirebaseAuth } from './auth/firebase'
import { UserClient } from '../clients/api/users'
import { WalletClient } from '../clients/api/wallets'

export class InternalCoreImpl implements InternalCore {
  private readonly authService: AuthService
  private readonly walletService: WalletService

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
  }

  wallet = {
    getInfo: () => this.walletService.getInfo(),
    create: (password: string) => this.walletService.create(password),
    retrieveWallet: (password: string) =>
      this.walletService.retrieveWallet(password),
  }

  network = {
    switch: async (networkId: string) => ({
      network: { id: networkId } as any,
    }),
    getNetworks: async () => [],
  }
}
