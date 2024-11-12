import {
  AvailableProviders,
  Blockchain,
  Coin,
  FirebaseCredentials
} from '@weblock-wallet/types'
import { UserClient } from '../clients/users'
import { Client } from '../utils/httpClient'
import { Firebase } from '../auth/firebase'
import LocalForage from '../utils/localForage'
import { OAuthProvider } from 'firebase/auth'
import { Jwt } from '../utils/jwt'

export class Users {
  private firebase: Firebase
  private userClient: UserClient
  private readonly orgHost: string

  constructor(client: Client, firebase: Firebase) {
    this.firebase = firebase
    this.userClient = new UserClient(client)
    this.orgHost = client.getOrgHost()
  }

  async signIn(provider: AvailableProviders): Promise<void> {
    try {
      const credentials: FirebaseCredentials = await this.firebase.signIn(
        new OAuthProvider(provider)
      )
      const response = await this.userClient.signIn({
        firebaseId: credentials.firebaseId,
        email: credentials.email,
        idToken: credentials.idToken,
        provider
      })
      const accessToken = response!.token
      await LocalForage.save(
        `${this.orgHost}:firebaseId`,
        credentials.firebaseId
      )
      await LocalForage.save(
        `${this.orgHost}:accessToken`,
        accessToken,
        Jwt.parse(accessToken)?.exp!
      )
      await LocalForage.save(`${this.orgHost}:isNewUser`, response!.isNewUser)
    } catch (error) {
      console.error('Error during sign-in:', error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    await this.firebase.signOut()
    await LocalForage.delete(`${this.orgHost}:firebaseId`)
    await LocalForage.delete(`${this.orgHost}:accessToken`)
    await LocalForage.delete(`${this.orgHost}:isNewUser`)
    await LocalForage.delete(`${this.orgHost}:share2`)
  }

  async isLoggedIn(): Promise<boolean> {
    const accessToken = await LocalForage.get(`${this.orgHost}:accessToken`)
    const firebaseId = await LocalForage.get(`${this.orgHost}:firebaseId`)
    return accessToken !== null && firebaseId !== null
  }

  async registerBlockchain(
    name: string,
    rpcUrl: string,
    chainId: number,
    currencySymbol: string,
    currencyName: string,
    currencyDecimals: number,
    explorerUrl: string,
    isTestnet: boolean
  ): Promise<void> {
    await this.userClient.registerBlockchain({
      name,
      rpcUrl,
      chainId,
      currencySymbol,
      currencyName,
      currencyDecimals,
      explorerUrl,
      isTestnet
    })
  }

  async getRegisteredBlockchains(): Promise<Blockchain[]> {
    return await this.userClient.getRegisteredBlockchains()
  }

  async registerToken(
    blockchainId: string,
    contractAddress: string,
    name: string,
    symbol: string,
    decimals: number
  ): Promise<Coin> {
    return await this.userClient.registerToken({
      blockchainId,
      contractAddress,
      name,
      symbol,
      decimals
    })
  }

  async getRegisteredCoins(blockchainId: string): Promise<Coin[]> {
    return await this.userClient.getRegisteredCoins(blockchainId)
  }

  async isNewUser(): Promise<boolean> {
    return (
      (await LocalForage.get<boolean>(`${this.orgHost}:isNewUser`)) ?? false
    )
  }
}
