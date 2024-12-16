// src/module/user.ts
import { SDKOptions, UserAPI } from '../types'

export class UserModule implements UserAPI {
  constructor(private readonly options: SDKOptions) {}

  async signIn(): Promise<{ isNewUser: boolean }> {
    throw new Error('Not implemented')
  }

  async signOut(): Promise<void> {
    throw new Error('Not implemented')
  }

  async isLoggedIn(): Promise<boolean> {
    throw new Error('Not implemented')
  }
}
