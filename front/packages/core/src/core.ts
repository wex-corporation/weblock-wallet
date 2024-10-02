import { Firebase } from './auth/firebase'
import { Client, WalletServerHttpClient } from './utils/httpClient'
import { Users } from './module/users'
import { AvailableProviders } from './infra/clients/users'
import { ERC20Info, Wallets } from './module/wallets'
import { Blockchain, Coin } from './domains'
import { TransactionStatus } from './types'
import { Wallet } from 'ethers'
import { Organizations } from './module/organizations'
import { ApiKeyPair } from './utils/crypto'

const getBaseUrls = (env: string) => {
  switch (env) {
    case 'local':
      return 'http://localhost:8080'
    case 'dev':
      return 'https://dev.alwallet.io'
    case 'stage':
      return 'https://staging.alwallet.io'
    case 'prod':
      return 'https://wallet.alwallet.io'
    default:
      throw new Error('Invalid env')
  }
}

const getFirebaseConfig = (env: string) => {
  switch (env) {
    case 'local':
      return {
        apiKey: 'AIzaSyBiaHmiqmnUVtuCfKJ3yc9g1rdoSKCJYlE',
        authDomain: 'al-tech-704e2.firebaseapp.com',
        projectId: 'al-tech-704e2',
        storageBucket: 'al-tech-704e2.appspot.com',
        messagingSenderId: '79434562951',
        appId: '1:79434562951:web:25571fdadf346b9ad9e722',
        measurementId: 'G-KDKWTTVWD7'
      }
    case 'dev':
      return {
        apiKey: 'AIzaSyBiaHmiqmnUVtuCfKJ3yc9g1rdoSKCJYlE',
        authDomain: 'al-tech-704e2.firebaseapp.com',
        projectId: 'al-tech-704e2',
        storageBucket: 'al-tech-704e2.appspot.com',
        messagingSenderId: '79434562951',
        appId: '1:79434562951:web:25571fdadf346b9ad9e722',
        measurementId: 'G-KDKWTTVWD7'
      }
    case 'stage':
      return {
        apiKey: 'AIzaSyBiaHmiqmnUVtuCfKJ3yc9g1rdoSKCJYlE',
        authDomain: 'al-tech-704e2.firebaseapp.com',
        projectId: 'al-tech-704e2',
        storageBucket: 'al-tech-704e2.appspot.com',
        messagingSenderId: '79434562951',
        appId: '1:79434562951:web:25571fdadf346b9ad9e722',
        measurementId: 'G-KDKWTTVWD7'
      }
    case 'prod':
      return {
        apiKey: 'AIzaSyBiaHmiqmnUVtuCfKJ3yc9g1rdoSKCJYlE',
        authDomain: 'al-tech-704e2.firebaseapp.com',
        projectId: 'al-tech-704e2',
        storageBucket: 'al-tech-704e2.appspot.com',
        messagingSenderId: '79434562951',
        appId: '1:79434562951:web:25571fdadf346b9ad9e722',
        measurementId: 'G-KDKWTTVWD7'
      }
    default:
      throw new Error('Invalid env')
  }
}

export interface SendTransaction {
  amount: string
  to: string
  coin: Coin
  nonce?: number
  gasLimit?: bigint
  gasPrice?: string
}

export class Core {
  private readonly firebase: Firebase
  private readonly client: Client
  private organizations: Organizations
  private users: Users
  private wallets: Wallets

  constructor(env: string, apiKey: string, orgHost: string) {
    this.client = new WalletServerHttpClient(
      {
        baseUrl: getBaseUrls(env)
      },
      apiKey,
      orgHost
    ) as any
    this.firebase = new Firebase(getFirebaseConfig(env))
    this.organizations = new Organizations(this.client)
    this.users = new Users(this.client, this.firebase)
    this.wallets = new Wallets(this.client)
  }

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
    await this.users.signIn(AvailableProviders.google)
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

  public getWallet(): Wallet | null {
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

    return await this.wallets.sendTransction(
      (await this.getBlockchains()).filter(
        (blockchain) => blockchain.chainId === chainId
      )[0].rpcUrl,
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

    return await this.wallets.getTransactionStatus(
      (await this.getBlockchains()).filter(
        (blockchain) => blockchain.chainId === chainId
      )[0].rpcUrl,
      chainId,
      txHash
    )
  }
}
