import { FirebaseAuth } from '../auth/firebase'
import { UserClient } from '../../clients/api/users'
import { LocalForage } from '../../utils/storage'

export class AuthService {
  constructor(
    private readonly firebase: FirebaseAuth,
    private readonly userClient: UserClient,
    private readonly orgHost: string
  ) {}

  async signIn(provider: string) {
    // 1. Firebase 인증
    const credentials = await this.firebase.signIn(provider)

    // 2. 서버 인증
    const { token, isNewUser } = await this.userClient.signIn({
      firebaseId: credentials.firebaseId,
      email: credentials.email,
      idToken: credentials.idToken,
      provider,
    })

    await LocalForage.save(`${this.orgHost}:firebaseId`, credentials.firebaseId)
    await LocalForage.save(`${this.orgHost}:token`, token)

    return {
      isNewUser,
      email: credentials.email,
      photoURL: credentials.photoURL,
      firebaseId: credentials.firebaseId,
      token,
    }
  }

  async signOut(): Promise<void> {
    await this.firebase.signOut()
    await LocalForage.delete(`${this.orgHost}:firebaseId`)
    await LocalForage.delete(`${this.orgHost}:token`)
    await LocalForage.delete(`${this.orgHost}:share2`)
  }
}
