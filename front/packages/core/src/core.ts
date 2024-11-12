// 설정 관련 import
import { defaultConfig } from './config'

// 유틸리티 관련 import
import { Client, WalletServerHttpClient } from './utils/httpClient'
import { Firebase } from './auth/firebase'
// import { Jwt } from './utils/jwt'
// import { Secrets } from './utils/secrets'

// 모듈 관련 import
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

    this.client = new WalletServerHttpClient({ baseUrl }, apiKey, orgHost)
    this.firebase = new Firebase(firebaseConfig)
    this.organizations = new Organizations(this.client)
    this.users = new Users(this.client, this.firebase)
    this.wallets = new Wallets(this.client)
  }

  // Organization 생성
  public async createOrganizations(name: string): Promise<ApiKeyPair> {
    return await this.organizations.createOrganization(name)
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
