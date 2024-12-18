import { FirebaseAuth } from '../auth/firebase'
import { UserClient } from '../../clients/api/users'
import { LocalForage } from '../../utils/storage'
import { WalletClient } from '@/clients/api/wallets'

export class AuthService {
  constructor(
    private readonly firebase: FirebaseAuth,
    private readonly userClient: UserClient,
    private readonly walletClient: WalletClient,
    private readonly orgHost: string
  ) {}

  async signIn(provider: string) {
    const credentials = await this.firebase.signIn(provider)

    const response = await this.userClient.signIn({
      firebaseId: credentials.firebaseId,
      email: credentials.email,
      idToken: credentials.idToken,
      provider,
    })

    console.log('Server response:', response)
    const { token, isNewUser } = response

    console.log('isNewUser value:', isNewUser)
    await LocalForage.save(`${this.orgHost}:firebaseId`, credentials.firebaseId)
    await LocalForage.save(`${this.orgHost}:accessToken`, token)
    await LocalForage.save(`${this.orgHost}:isNewUser`, isNewUser)

    const savedIsNewUser = await LocalForage.get(`${this.orgHost}:isNewUser`)
    console.log('Saved isNewUser:', savedIsNewUser)

    let status: 'NEW_USER' | 'WALLET_READY' | 'NEEDS_PASSWORD'
    if (isNewUser) {
      status = 'NEW_USER'
    } else {
      const walletInfo = await this.walletClient.getWallet()
      if (!walletInfo) {
        status = 'NEW_USER'
      } else {
        const encryptedShare2 = await LocalForage.get<string>(
          `${this.orgHost}:encryptedShare2`
        )
        if (encryptedShare2) {
          status = 'NEEDS_PASSWORD'
        } else {
          status = 'WALLET_READY'
        }
      }
    }

    return {
      isNewUser,
      email: credentials.email,
      photoURL: credentials.photoURL,
      firebaseId: credentials.firebaseId,
      token,
      status,
    }
  }

  async signOut(): Promise<void> {
    await this.firebase.signOut()
    await LocalForage.delete(`${this.orgHost}:firebaseId`)
    await LocalForage.delete(`${this.orgHost}:accessToken`)
    await LocalForage.delete(`${this.orgHost}:share2`)
  }

  async clearNewUserFlag(): Promise<void> {
    await LocalForage.delete(`${this.orgHost}:isNewUser`)
  }
}
