import { AuthModule } from './auth'
import { UserClient } from '../clients/users'
import { LocalForage } from '../utils/localForage'
import { AvailableProviders } from '@wefunding-dev/wallet-types'

export class UsersModule {
  private auth: AuthModule
  private userClient: UserClient
  private orgHost: string

  constructor(auth: AuthModule, client: UserClient, orgHost: string) {
    this.auth = auth
    this.userClient = client
    this.orgHost = orgHost
  }

  async signIn(providerId: AvailableProviders): Promise<void> {
    await this.auth.signInWithProvider(providerId)

    const firebaseId = await LocalForage.get<string>('firebaseId')
    const idToken = await LocalForage.get<string>('accessToken')
    const email = await LocalForage.get<string>('email')

    if (!firebaseId || !idToken || !email) {
      throw new Error('Authentication failed.')
    }

    const response = await this.userClient.signIn({
      firebaseId,
      email,
      idToken,
      provider: providerId
    })

    await LocalForage.save(`${this.orgHost}:isNewUser`, response.isNewUser)
  }

  async signOut(): Promise<void> {
    await this.auth.signOut()
    await LocalForage.delete(`${this.orgHost}:isNewUser`)
  }

  async isLoggedIn(): Promise<boolean> {
    return this.auth.isLoggedIn()
  }

  async isNewUser(): Promise<boolean> {
    return (
      (await LocalForage.get<boolean>(`${this.orgHost}:isNewUser`)) ?? false
    )
  }
}
