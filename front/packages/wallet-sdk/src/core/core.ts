// sdk/src/core/core.ts
import {
  Firebase,
  Users,
  Wallets,
  Organizations,
  WalletServerHttpClient
} from '@alwallet/core' // 필요한 core 모듈들 import
import { EnvironmentConfig, SendTransaction, Blockchain } from '../types' // types에서 정의한 인터페이스 사용
import { Wallet as EthersWallet } from 'ethers'
import { AvailableProviders } from '@alwallet/core/dist/infra/clients/users'

export class Core {
  private firebase: Firebase
  private client: WalletServerHttpClient
  private users: Users
  private wallets: Wallets
  private organizations: Organizations

  constructor(envConfig: EnvironmentConfig, apiKey: string, orgHost: string) {
    // Firebase와 WalletServerHttpClient 초기화
    this.firebase = new Firebase(envConfig.firebaseConfig)
    this.client = new WalletServerHttpClient(
      {
        baseUrl: envConfig.apiBaseUrl
      },
      apiKey,
      orgHost
    )

    // core 패키지에서 가져온 모듈들을 초기화
    this.organizations = new Organizations(this.client)
    this.users = new Users(this.client, this.firebase)
    this.wallets = new Wallets(this.client)
  }

  // Google을 통한 로그인 처리
  async signInWithGoogle(): Promise<void> {
    // 이미 로그인 상태라면 중복 로그인 방지
    if (await this.users.isLoggedIn()) return

    // Firebase 자격 증명을 API 서버로 전송하여 로그인 처리
    await this.users.signIn(AvailableProviders.google)
  }

  // 지갑 복구 또는 생성 (비밀번호 필요)
  async retrieveWallet(password?: string): Promise<void> {
    if (!(await this.users.isLoggedIn())) {
      throw new Error('로그인이 필요합니다.')
    }

    // 지갑이 없는 경우, 비밀번호로 새 지갑 생성
    if (await this.users.isNewUser()) {
      if (!password) throw new Error('새 사용자에게는 비밀번호가 필요합니다.')
      await this.wallets.createWallet(password)
    }
    await this.wallets.retrieveWallet(password)
  }

  // 트랜잭션 전송
  async sendTransaction(chainId: number, transaction: SendTransaction) {
    const blockchain = (await this.users.getRegisteredBlockchains()).find(
      (bc) => bc.chainId === chainId
    )
    if (!blockchain)
      throw new Error(
        `해당 체인 ID(${chainId})에 대한 블록체인을 찾을 수 없습니다.`
      )

    return await this.wallets.sendTransaction(
      blockchain.rpcUrl,
      chainId,
      transaction.amount,
      transaction.to,
      transaction.coin,
      transaction.nonce,
      transaction.gasLimit,
      transaction.gasPrice
    )
  }

  // 지갑을 가져오는 메서드
  public getWallet(): EthersWallet | null {
    return this.wallets.wallet // 지갑 모듈에서 지갑을 반환
  }

  // 등록된 블록체인 목록을 가져오는 메서드
  public async getBlockchains(): Promise<Blockchain[]> {
    return this.users.getRegisteredBlockchains() // users 모듈에서 블록체인 목록을 반환
  }

  // 트랜잭션 상태 조회
  async getTransactionStatus(chainId: number, txHash: string) {
    const blockchain = (await this.users.getRegisteredBlockchains()).find(
      (bc) => bc.chainId === chainId
    )
    if (!blockchain)
      throw new Error(
        `해당 체인 ID(${chainId})에 대한 블록체인을 찾을 수 없습니다.`
      )

    return await this.wallets.getTransactionStatus(
      blockchain.rpcUrl,
      chainId,
      txHash
    )
  }

  // 지갑 잔액 조회
  async getBalance(chainId: number): Promise<string> {
    if (!(await this.users.isLoggedIn())) {
      throw new Error('로그인이 필요합니다.')
    }
    return await this.wallets.getBalance(chainId)
  }

  // 필요시 다른 모듈에 접근할 수 있게 getter를 제공
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
