import { Wallets } from '@alwallet/core/src/module/wallets'
import { HttpClient } from '@alwallet/core/src/utils/httpClient'

interface AlWalletSDKOptions {
  baseUrl: string
  apiKey: string
  orgHost: string
}

export class AlWalletSDK {
  private wallets: Wallets

  constructor(options: AlWalletSDKOptions) {
    const client = new HttpClient({ baseUrl: options.baseUrl })
    this.wallets = new Wallets(client)
  }

  /**
   * Create a new wallet with the given user password.
   * @param userPassword The user's password for key encryption.
   */
  async createWallet(userPassword: string): Promise<void> {
    return await this.wallets.createWallet(userPassword)
  }

  /**
   * Restore the wallet using the user's password.
   * @param userPassword The password to decrypt and restore the wallet.
   */
  async restoreWallet(userPassword: string): Promise<void> {
    return await this.wallets.retrieveWallet(userPassword)
  }

  /**
   * Get the balance of the wallet.
   * @param chainId The ID of the blockchain network.
   * @returns The balance in string format.
   */
  async getBalance(chainId: number): Promise<string> {
    return await this.wallets.getBalance(chainId)
  }

  /**
   * Send a transaction.
   * @param nodeUrl The URL of the blockchain node.
   * @param chainId The ID of the blockchain network.
   * @param amount The amount to send.
   * @param to The recipient's address.
   * @param coin The coin or token to send.
   */
  async sendTransaction(
    nodeUrl: string,
    chainId: number,
    amount: string,
    to: string,
    coin: any
  ): Promise<string> {
    return await this.wallets.sendTransction(nodeUrl, chainId, amount, to, coin)
  }

  /**
   * Check the status of a transaction.
   * @param nodeUrl The URL of the blockchain node.
   * @param chainId The ID of the blockchain network.
   * @param txHash The hash of the transaction.
   * @returns The status of the transaction.
   */
  async getTransactionStatus(
    nodeUrl: string,
    chainId: number,
    txHash: string
  ): Promise<string> {
    return await this.wallets.getTransactionStatus(nodeUrl, chainId, txHash)
  }
}
