// src/auth/auth.ts
import { Users } from '@alwallet/core/src/module/users'
import { AvailableProviders } from '@alwallet/core/src/infra/clients/users'
import { Firebase, FirebaseConfig } from '@alwallet/core/src/auth/firebase'
import { WalletServerHttpClient } from '@alwallet/core/src/utils/httpClient' // WalletServerHttpClient import
import { SDKError } from '../utils/errors'

export class Auth {
  private users: Users

  constructor(client: WalletServerHttpClient, firebaseConfig: FirebaseConfig) {
    const firebase = new Firebase(firebaseConfig)
    this.users = new Users(client, firebase)
  }

  async signInWithGoogle(): Promise<void> {
    try {
      console.log('Google 로그인 시작')
      await this.users.signIn(AvailableProviders.google)
    } catch (error) {
      console.error('Google 로그인 실패:', error)

      // 'error'를 명시적으로 Error 타입으로 단언
      const err = error as Error
      throw new SDKError(`Google 로그인 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  async signOut(): Promise<void> {
    try {
      console.log('로그아웃 중...')
      await this.users.signOut()
    } catch (error) {
      console.error('로그아웃 실패:', error)
      const err = error as Error
      throw new SDKError(`로그아웃 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      return await this.users.isLoggedIn()
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error)
      const err = error as Error
      throw new SDKError(
        `로그인 상태 확인 중 오류가 발생했습니다: ${err.message}`
      )
    }
  }
}
