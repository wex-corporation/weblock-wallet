import { Core } from '@alwallet/core' // Core 패키지의 기능 사용

export class AuthManager {
  private core: Core

  constructor(env: string, apiKey: string, orgHost: string) {
    this.core = new Core(env, apiKey, orgHost) // Core 인스턴스 생성
  }

  // Google 로그인
  async signInWithGoogle(): Promise<void> {
    await this.core.signInWithGoogle()
  }

  // 로그아웃
  async signOut(): Promise<void> {
    await this.core.signOut()
  }
}
