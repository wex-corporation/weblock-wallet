import { Users } from '@alwallet/core/src/module/users'
import { AvailableProviders } from '@alwallet/core/src/infra/clients/users'
import { Firebase, FirebaseConfig } from '@alwallet/core/src/auth/firebase'
import { Client } from '@alwallet/core/src/utils/httpClient'

export class Auth {
  private users: Users

  constructor(client: Client, firebaseConfig: FirebaseConfig) {
    const firebase = new Firebase(firebaseConfig)
    this.users = new Users(client, firebase) // Users 모듈 초기화
  }

  async signInWithGoogle(): Promise<void> {
    console.log('Google sign-in initiated.')
    await this.users.signIn(AvailableProviders.google) // Users 모듈 통해 로그인
  }

  async signOut(): Promise<void> {
    console.log('User signed out.')
    await this.users.signOut() // Users 모듈 통해 로그아웃
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.users.isLoggedIn() // 로그인 상태 확인
  }
}
