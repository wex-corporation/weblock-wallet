// packages/core/src/sdk/WalletSdk.ts
import { Firebase } from '../auth/firebase'
import { Users } from '../module/users'
import { Wallets } from '../module/wallets'
import { Organizations } from '../module/organizations'
import { WalletServerHttpClient } from '../utils/httpClient'
import { EnvironmentConfig } from '../types'
import { Numbers } from '../utils/numbers'
import { AvailableProviders } from '../infra/clients/users'
import { Wallet } from 'ethers'
import { Blockchain } from '../domains'

export class WalletSdk {
  private static instance: WalletSdk | null = null
  private firebase: Firebase
  private client: WalletServerHttpClient
  private users: Users
  private wallets: Wallets
  private organizations: Organizations

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

    // 각 모듈 인스턴스화
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
    await this.users.signOut()
    this.wallets.wallet = null // 지갑 인스턴스 초기화
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

  // 지갑 정보 가져오기
  public getWallet(): Wallet | null {
    return this.wallets.wallet
  }

  // 블록체인 목록 가져오기
  public async getBlockchains(): Promise<Blockchain[]> {
    return this.users.getRegisteredBlockchains()
  }

  // 잔액 조회
  public async getBalance(chainId: number): Promise<string> {
    if (!(await this.users.isLoggedIn())) {
      throw new Error('로그인이 필요합니다.')
    }
    const balanceWei = await this.wallets.getBalance(chainId)
    return this.weiToEth(balanceWei) // 편의를 위해 ETH 단위로 변환
  }

  // 화폐 단위 변환
  public weiToEth(wei: string): string {
    return Numbers.weiToEth(wei)
  }

  public hexToDecimal(hexString: string): string {
    return Numbers.hexToDecimal(hexString)
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
