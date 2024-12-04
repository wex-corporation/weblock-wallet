import { AuthModule } from './auth'
import { UserClient } from '../clients'
import { AvailableProviders, SignInRequest } from '@wefunding-dev/wallet-types'
import { AuthResponse } from '../types/auth'
import { LocalForage } from '../utils/localForage'

export class UsersModule {
  constructor(
    private readonly auth: AuthModule,
    private readonly userClient: UserClient,
    private readonly orgHost: string
  ) {}

  async signIn(providerId: AvailableProviders): Promise<AuthResponse> {
    const credentials = await this.auth.signInWithProvider(providerId)

    const signInRequest: SignInRequest = {
      firebaseId: credentials.firebaseId,
      email: credentials.email,
      idToken: credentials.idToken,
      provider: providerId
    }

    const signInResponse = await this.userClient.signIn(signInRequest)

    await LocalForage.save(`${this.orgHost}:firebaseId`, credentials.firebaseId)
    await LocalForage.save(`${this.orgHost}:idToken`, credentials.idToken)
    await LocalForage.save(`${this.orgHost}:email`, credentials.email)
    if (signInResponse.token) {
      await LocalForage.save(
        `${this.orgHost}:accessToken`,
        signInResponse.token
      )
    }

    return {
      isNewUser: signInResponse.isNewUser,
      email: credentials.email,
      photoURL: credentials.photoURL || undefined
    }
  }

  async signOut(): Promise<void> {
    await this.auth.signOut()
    await LocalForage.delete(`${this.orgHost}:firebaseId`)
    await LocalForage.delete(`${this.orgHost}:idToken`)
    await LocalForage.delete(`${this.orgHost}:email`)
    await LocalForage.delete(`${this.orgHost}:accessToken`)
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await LocalForage.get(`${this.orgHost}:accessToken`)
    return !!token
  }

  async isNewUser(): Promise<boolean> {
    const token = await LocalForage.get(`${this.orgHost}:accessToken`)
    if (!token) return false
    return false
  }
}
