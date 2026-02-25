import { FirebaseAuth } from '../auth/firebase'
import { UserClient } from '../../clients/api/users'
import { LocalForage } from '../../utils/storage'
import { WalletClient } from '@/clients/api/wallets'
import { Jwt } from '../../utils/jwt'
import { SignInStatus, SDKError, SDKErrorCode } from '@/index'

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

    const { token, isNewUser } = response

    const payload = Jwt.tryParse(token)
    const exp = payload?.exp ? payload.exp * 1000 : null

    if (!exp || !Number.isFinite(exp) || exp <= Date.now()) {
      throw new SDKError(
        'Invalid access token received from server',
        SDKErrorCode.INVALID_RESPONSE
      )
    }

    await LocalForage.save(`${this.orgHost}:firebaseId`, credentials.firebaseId)
    await LocalForage.save(`${this.orgHost}:accessToken`, token, exp)
    await LocalForage.save(`${this.orgHost}:isNewUser`, isNewUser)

    let status: SignInStatus
    if (isNewUser) {
      status = SignInStatus.NEW_USER
    } else {
      const encryptedShare2 = await LocalForage.get<string>(
        `${this.orgHost}:encryptedShare2`
      )
      if (!encryptedShare2) {
        status = SignInStatus.NEEDS_PASSWORD
      } else {
        const share2 = await LocalForage.get<string>(`${this.orgHost}:share2`)
        status = share2
          ? SignInStatus.WALLET_READY
          : SignInStatus.NEEDS_PASSWORD
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
    await Promise.all([
      LocalForage.delete(`${this.orgHost}:currentNetwork`),
      LocalForage.delete(`${this.orgHost}:firebaseId`),
      LocalForage.delete(`${this.orgHost}:accessToken`),
      LocalForage.delete(`${this.orgHost}:encryptedShare2`),
      LocalForage.delete(`${this.orgHost}:isNewUser`),
      LocalForage.delete(`${this.orgHost}:share2`),
      LocalForage.delete(`${this.orgHost}:walletAddress`),
    ])
  }

  async clearNewUserFlag(): Promise<void> {
    await LocalForage.save(`${this.orgHost}:isNewUser`, false)
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const [firebaseId, accessToken] = await Promise.all([
        LocalForage.get<string>(`${this.orgHost}:firebaseId`),
        LocalForage.get<string>(`${this.orgHost}:accessToken`),
      ])

      return !!(firebaseId && accessToken)
    } catch (error) {
      console.error('Error checking login status:', error)
      return false
    }
  }

  async getAuthInfo(): Promise<{
    firebaseId?: string
    accessToken?: string
    isNewUser?: boolean
  }> {
    try {
      const [firebaseId, accessToken, isNewUser] = await Promise.all([
        LocalForage.get<string>(`${this.orgHost}:firebaseId`),
        LocalForage.get<string>(`${this.orgHost}:accessToken`),
        LocalForage.get<boolean>(`${this.orgHost}:isNewUser`),
      ])

      return {
        firebaseId: firebaseId ?? undefined,
        accessToken: accessToken ?? undefined,
        isNewUser: isNewUser ?? undefined,
      }
    } catch (error) {
      console.error('Error getting auth info:', error)
      return {}
    }
  }
}
