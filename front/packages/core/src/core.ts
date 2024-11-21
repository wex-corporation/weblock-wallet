// 설정 관련 import
import { defaultConfig } from './config'

// 유틸리티 관련 import
import { Client, WalletServerHttpClient } from './utils/httpClient'
import { Firebase } from './auth/firebase'
import { OAuthProvider } from 'firebase/auth'
import { LocalForage } from './utils/localForage'
import { Jwt } from './utils/jwt'
// import { Secrets } from './utils/secrets'

// 모듈 관련 import
import { UserClient } from './clients/users'
import { OrganizationClient } from './clients/organizations'
import { Users } from './module/users'
import { Organizations } from './module/organizations'
import { Wallets } from './module/wallets'
import { Wallet as EthersWallet } from 'ethers'

// 타입 정의 관련 import
import {
  AvailableProviders,
  AppConfig,
  ApiKeyPair,
  Blockchain,
  Coin,
  // ERC20Info,
  TransactionStatus,
  // CreateWalletRequest,
  SendTransaction
} from '@weblock-wallet/types'

export class Core {
  private readonly firebase: Firebase
  private readonly client: Client
  private readonly orgHost: string
  private organizations: Organizations
  private users: Users
  private wallets: Wallets

  constructor(
    env: keyof AppConfig['baseUrls'],
    apiKey: string,
    orgHost: string
  ) {
    const baseUrl = defaultConfig.baseUrls[env]
    const firebaseConfig = defaultConfig.firebaseConfig

    this.orgHost = orgHost
    this.client = new WalletServerHttpClient({ baseUrl }, apiKey, orgHost)
    this.firebase = new Firebase(firebaseConfig)
    this.organizations = new Organizations(this.client)
    this.users = new Users(this.client, this.firebase)
    this.wallets = new Wallets(this.client)
  }
  getOrgHost(): string {
    return this.orgHost
  }
  getClient(): Client {
    return this.client
  }

  public async developerSignIn(providerId: string): Promise<void> {
    try {
      const provider = new OAuthProvider(providerId)
      const credentials = await this.firebase.signIn(provider)

      const { firebaseId, idToken, email } = credentials
      console.log('Firebase login successful:', { firebaseId, idToken, email })

      // 사용자 인증 및 accessToken 가져오기
      const userClient = new UserClient(this.client)
      const signInResponse = await userClient.signIn({
        firebaseId,
        idToken,
        email,
        provider: AvailableProviders.Google // 또는 다른 provider
      })

      if (!signInResponse || !signInResponse.token) {
        throw new Error(
          'Failed to retrieve accessToken during developer sign-in'
        )
      }

      const accessToken = signInResponse.token
      const expiration = Jwt.parse(accessToken)?.exp

      if (!expiration) {
        throw new Error('Failed to parse expiration from access token')
      }

      // LocalForage에 저장
      await LocalForage.save(`${this.orgHost}:firebaseId`, firebaseId)
      await LocalForage.save(`${this.orgHost}:idToken`, idToken)
      await LocalForage.save(`${this.orgHost}:email`, email)
      await LocalForage.save(
        `${this.orgHost}:accessToken`,
        accessToken,
        expiration
      )

      console.log('Developer signed in and data saved to LocalForage:', {
        firebaseId,
        idToken,
        email,
        accessToken
      })
    } catch (error) {
      console.error('Error during developer sign-in:', error)
      throw error
    }
  }

  public async developerSignOut(): Promise<void> {
    try {
      await this.firebase.signOut()
      await LocalForage.delete(`${this.orgHost}:firebaseId`)
      await LocalForage.delete(`${this.orgHost}:idToken`)
      await LocalForage.delete(`${this.orgHost}:email`)
      await LocalForage.delete(`${this.orgHost}:accessToken`)

      console.log('Developer signed out and data removed from LocalForage.')
    } catch (error) {
      console.error('Error during developer sign-out:', error)
      throw error
    }
  }

  // 개발자가 조직을 생성하고 사용자를 등록하는 메서드
  public async createOrganizationsWithUser(
    orgName: string
  ): Promise<ApiKeyPair> {
    try {
      // 1. Firebase 자격 증명 확인
      const firebaseId = await LocalForage.get<string>(
        `${this.getOrgHost()}:firebaseId`
      )
      const email = await LocalForage.get<string>(`${this.getOrgHost()}:email`)
      const idToken = await LocalForage.get<string>(
        `${this.getOrgHost()}:idToken`
      )
      const accessToken = await LocalForage.get<string>(
        `${this.getOrgHost()}:accessToken`
      )

      console.log('Step 1: Retrieved Firebase credentials', {
        firebaseId,
        email,
        idToken,
        accessToken
      })

      if (!firebaseId || !email || !idToken || !accessToken) {
        console.error(
          'Step 1 Error: Missing Firebase credentials or access token'
        )
        throw new Error(
          'Missing Firebase credentials or access token. Please log in again.'
        )
      }

      // 2. 조직 생성
      console.log('Step 2: Creating organization with name:', orgName)
      const organization = await this.organizations.createOrganization(orgName)
      console.log('Step 2 Success: Organization created', organization)

      // 3. Core 초기화 (새로운 API Key 사용)
      console.log(
        'Step 3: Reinitializing Core with new organization credentials'
      )
      const newCore = new Core(
        'local',
        organization.apiKey,
        'http://localhost:3000'
      )
      console.log('Step 3 Success: Core re-initialized')

      // 4. 새로운 Core로 사용자 등록
      console.log('Step 4: Registering user with new organization')
      const userClient = new UserClient(newCore['client'])
      const signInResponse = await userClient.signIn({
        firebaseId,
        email,
        idToken,
        provider: AvailableProviders.Google
      })
      console.log('Step 4 Success: User registered', signInResponse)

      // 5. API Key 반환
      console.log(
        'Step 5: Returning new organization API Key',
        organization.apiKey
      )
      return organization
    } catch (error) {
      console.error('Error during createOrganizationsWithUser:', error)
      throw error
    }
  }

  public getOrganizations(): Organizations {
    return this.organizations
  }

  public async signInWithGoogle(): Promise<void> {
    if (await this.users.isLoggedIn()) {
      return
    }
    console.log('signing in with google')
    // SignOut first to clear data
    await this.users.signOut()
    await this.users.signIn(AvailableProviders.Google)
  }

  public async signOut(): Promise<void> {
    await this.users.signOut()
    this.users = new Users(this.client, this.firebase)
    this.wallets = new Wallets(this.client)
  }

  public async registerBlockchain(
    name: string,
    rpcUrl: string,
    chainId: number,
    currencySymbol: string,
    currencyName: string,
    currencyDecimals: number,
    explorerUrl: string,
    isTestnet: boolean
  ): Promise<void> {
    await this.users.registerBlockchain(
      name,
      rpcUrl,
      chainId,
      currencySymbol,
      currencyName,
      currencyDecimals,
      explorerUrl,
      isTestnet
    )
  }

  public async getBlockchains(): Promise<Blockchain[]> {
    return this.users.getRegisteredBlockchains()
  }

  public async registerToken(
    chainId: number,
    contractAddress: string
  ): Promise<Coin> {
    const blockchain = (await this.getBlockchains()).filter(
      (blockchain) => blockchain.chainId === chainId
    )[0]

    const { name, symbol, decimals } = await this.wallets.getCoinInfo(
      blockchain.rpcUrl,
      contractAddress
    )

    return await this.users.registerToken(
      blockchain.id,
      contractAddress,
      name,
      symbol,
      decimals
    )
  }

  public async getCoins(chainId: number): Promise<Coin[]> {
    const blockchain = (await this.getBlockchains()).filter(
      (blockchain) => blockchain.chainId === chainId
    )[0]
    return this.users.getRegisteredCoins(blockchain.id)
  }

  // NOTE: Later, it might be better to use pincode and 2FA so that the user can recover wallet even if they lose their password
  public async retrieveWallet(userPassword?: string): Promise<void> {
    if (!(await this.users.isLoggedIn())) {
      throw new Error('Must sign in first')
    }

    if (await this.users.isNewUser()) {
      if (!userPassword) {
        throw new Error('Must provide userPassword for new user')
      }
      await this.wallets.createWallet(userPassword)
    }

    await this.wallets.retrieveWallet(userPassword)
  }

  public getWallet(): EthersWallet | null {
    return this.wallets.wallet
  }

  public async getBalance(chainId: number): Promise<string> {
    if (!(await this.users.isLoggedIn())) {
      throw new Error('Must sign in first')
    }

    return await this.wallets.getBalance(chainId)
  }

  public async sendTransaction(chainId: number, transaction: SendTransaction) {
    if (!(await this.users.isLoggedIn())) {
      throw new Error('Must sign in first')
    }

    const blockchain = await this.getBlockchainByChainId(chainId)

    return await this.wallets.sendTransction(
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

  public async getTransactionStatus(
    chainId: number,
    txHash: string
  ): Promise<TransactionStatus> {
    if (!(await this.users.isLoggedIn())) {
      throw new Error('Must sign in first')
    }

    const blockchain = await this.getBlockchainByChainId(chainId)
    return await this.wallets.getTransactionStatus(
      blockchain.rpcUrl,
      chainId,
      txHash
    )
  }

  private async getBlockchainByChainId(chainId: number): Promise<Blockchain> {
    const blockchain = (await this.getBlockchains()).find(
      (blockchain) => blockchain.chainId === chainId
    )
    if (!blockchain) {
      throw new Error(`Blockchain with chainId ${chainId} not found`)
    }
    return blockchain
  }
}
