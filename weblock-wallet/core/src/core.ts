import { defaultConfig } from './config'

// 유틸리티 관련 import
import { WalletServerHttpClient } from './utils/httpClient'
import { Firebase } from './auth/firebase'

// 모듈 관련 import
import { AuthModule } from './modules/auth'
import { UsersModule } from './modules/users'

// 타입 정의 관련 import
import { AvailableProviders } from '@wefunding-dev/wallet-types'
import { UserClient } from './clients'

export class Core {
  private readonly auth: AuthModule
  private readonly users: UsersModule

  constructor(
    env: keyof (typeof defaultConfig)['baseUrls'],
    apiKey: string,
    orgHost: string
  ) {
    const baseUrl = defaultConfig.baseUrls[env]

    // HttpClient 및 Firebase 초기화
    const client = new WalletServerHttpClient({ baseUrl }, apiKey, orgHost)
    const firebase = new Firebase()

    // AuthModule 및 UsersModule 초기화
    this.auth = new AuthModule(firebase)
    const userClient = new UserClient(client)
    this.users = new UsersModule(this.auth, userClient, orgHost)

    console.log(`[Core] Initialized with env: ${env}, orgHost: ${orgHost}`)
  }

  async signInWithProvider(providerId: AvailableProviders): Promise<void> {
    await this.users.signIn(providerId)
  }

  async signOut(): Promise<void> {
    await this.users.signOut()
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.users.isLoggedIn()
  }

  async isNewUser(): Promise<boolean> {
    return await this.users.isNewUser()
  }
}
