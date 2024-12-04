import { AuthModule } from './auth'
import { UserClient } from '../clients/users'
import { LocalForage } from '../utils/localForage'
import { AvailableProviders } from '@wefunding-dev/wallet-types'
import { UserInfo, AuthResponse } from '../types/auth'

export class UsersModule {
  private auth: AuthModule
  private userClient: UserClient
  private orgHost: string

  constructor(auth: AuthModule, client: UserClient, orgHost: string) {
    this.auth = auth
    this.userClient = client
    this.orgHost = orgHost
  }

  async signIn(providerId: AvailableProviders): Promise<AuthResponse> {
    const firebaseUserInfo = await this.auth.signInWithProvider(providerId)

    if (!firebaseUserInfo) {
      throw new Error('Firebase authentication failed')
    }

    const response = await this.userClient.signIn({
      firebaseId: firebaseUserInfo.uid,
      email: firebaseUserInfo.email ?? '',
      idToken: firebaseUserInfo.idToken,
      provider: providerId
    })

    const authResponse: AuthResponse = {
      isNewUser: response.isNewUser,
      user: {
        email: firebaseUserInfo.email,
        displayName: firebaseUserInfo.displayName,
        photoURL: firebaseUserInfo.photoURL
      },
      token: response.token
    }

    await this.saveUserData(authResponse)
    return authResponse
  }

  private async saveUserData(response: AuthResponse): Promise<void> {
    const prefix = `${this.orgHost}:`
    await LocalForage.save(`${prefix}isNewUser`, response.isNewUser)
    await LocalForage.save(`${prefix}user`, response.user)
    await LocalForage.save(`${prefix}token`, response.token)
  }

  async signOut(): Promise<void> {
    await this.auth.signOut()
    await this.clearUserData()
  }

  private async clearUserData(): Promise<void> {
    const prefix = `${this.orgHost}:`
    await LocalForage.delete(`${prefix}isNewUser`)
    await LocalForage.delete(`${prefix}user`)
    await LocalForage.delete(`${prefix}token`)
  }

  async getUserInfo(): Promise<UserInfo | null> {
    return await LocalForage.get<UserInfo>(`${this.orgHost}:user`)
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await LocalForage.get<string>(`${this.orgHost}:token`)
    return !!token
  }

  async isNewUser(): Promise<boolean> {
    return (
      (await LocalForage.get<boolean>(`${this.orgHost}:isNewUser`)) ?? false
    )
  }
}
