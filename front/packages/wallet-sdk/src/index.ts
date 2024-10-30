// wallet-sdk/src/index.ts
import {
  Firebase,
  Users,
  Wallets,
  Organizations,
  WalletServerHttpClient
} from '@alwallet/core'
import { EnvironmentConfig, SendTransaction, Blockchain } from './types'
import { Wallet as EthersWallet } from 'ethers'
import { AvailableProviders } from '@alwallet/core/dist/infra/clients/users'

export class WalletSdk {
  private static instance: WalletSdk | null = null
  private firebase: Firebase
  private client: WalletServerHttpClient
  private users: Users
  private wallets: Wallets
  private organizations: Organizations

  // private 생성자
  private constructor(
    envConfig: EnvironmentConfig,
    apiKey: string,
    orgHost: string
  ) {
    // Firebase와 WalletServerHttpClient 초기화
    this.firebase = new Firebase(envConfig.firebaseConfig)
    this.client = new WalletServerHttpClient(
      { baseUrl: envConfig.apiBaseUrl },
      apiKey,
      orgHost
    )

    // core 패키지에서 가져온 모듈들 초기화
    this.organizations = new Organizations(this.client)
    this.users = new Users(this.client, this.firebase)
    this.wallets = new Wallets(this.client)
  }

  // 싱글톤 인스턴스를 제공하는 메서드
  public static getInstance(
    envConfig: EnvironmentConfig,
    apiKey: string,
    orgHost: string
  ): WalletSdk {
    if (!WalletSdk.instance) {
      WalletSdk.instance = new WalletSdk(envConfig, apiKey, orgHost)
    }
    return WalletSdk.instance
  }

  // 로그인 메서드
  public async signInWithGoogle(): Promise<void> {
    if (await this.users.isLoggedIn()) return
    await this.users.signOut()
    await this.users.signIn(AvailableProviders.google)
  }

  // 로그아웃 메서드
  public async signOut(): Promise<void> {
    await this.users.signOut() // Firebase 및 로컬 데이터 정리
    // 필요 시, 지갑 데이터 등도 초기화
    this.wallets.wallet = null // 지갑 인스턴스 초기화
    console.log("로그아웃 성공적으로 완료되었습니다.")
  }

  // 지갑 복구 메서드
  public async retrieveWallet(password?: string): Promise<void> {
    if (!(await this.users.isLoggedIn())) {
      throw new Error('로그인이 필요합니다.')
    }
    if (await this.users.isNewUser()) {
      if (!password) throw new Error('새 사용자에게는 비밀번호가 필요합니다.')
      await this.wallets.createWallet(password)
    }
    await this.wallets.retrieveWallet(password)
  }

  // 지갑 정보를 가져오는 메서드
  public getWallet(): EthersWallet | null {
    return this.wallets.wallet
  }

  // 기타 필요한 메서드들 (getBlockchains, getBalance 등)
  public async getBlockchains(): Promise<Blockchain[]> {
    return this.users.getRegisteredBlockchains()
  }

  public async getBalance(chainId: number): Promise<string> {
    if (!(await this.users.isLoggedIn())) {
      throw new Error('로그인이 필요합니다.')
    }
    return await this.wallets.getBalance(chainId)
  }

  // 모듈 접근을 위한 getter 메서드
  public getOrganizationsModule(): Organizations {
    return this.organizations
  }

  public getUsersModule(): Users {
    return this.users
  }

  public getWalletsModule(): Wallets {
    return this.wallets
  }
}

// WalletSdk 클래스를 기본 export로 제공
export default WalletSdk
export * from './types'
