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

  // Google 로그인 처리
  public async signInWithGoogle(): Promise<void> {
    try {
      await this.users.signIn(AvailableProviders.google)
    } catch (error) {
      const err = error as Error
      throw new SDKError(`Google 로그인 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  // 로그아웃 처리
  public async signOut(): Promise<void> {
    try {
      await this.users.signOut()
    } catch (error) {
      const err = error as Error
      throw new SDKError(`로그아웃 중 오류가 발생했습니다: ${err.message}`)
    }
  }

  // 로그인 상태 확인
  public async isLoggedIn(): Promise<boolean> {
    try {
      return await this.users.isLoggedIn()
    } catch (error) {
      const err = error as Error
      throw new SDKError(
        `로그인 상태 확인 중 오류가 발생했습니다: ${err.message}`
      )
    }
  }

  public getUsers(): Users {
    return this.users
  }

  // 새로운 사용자 여부 확인
  public async isNewUser(): Promise<boolean> {
    try {
      return await this.users.isNewUser()
    } catch (error) {
      const err = error as Error
      throw new SDKError(
        `새 사용자 여부 확인 중 오류가 발생했습니다: ${err.message}`
      )
    }
  }
}
