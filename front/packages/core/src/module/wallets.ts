import { Client } from '../utils/httpClient'
import { CreateWalletRequest, WalletClient } from '../infra/clients/wallets'
import LocalForage from '../utils/localForage'
import { RpcClient } from '../infra/clients/rpcs'
import { Web3 } from 'web3'
import { ERC20_ABI } from '../contract/contracts'
import { TransactionStatus } from '../types'
import { Jwt } from '../utils/jwt'
import { generateMnemonic, mnemonicToSeed } from 'bip39'
import { Secrets } from '../utils/secrets'
import crypto from 'crypto'
import * as domain from '../domains'
import { toBigInt, Wallet } from 'ethers'
import { Coin } from '../domains'

export interface ERC20Info {
  name: string
  symbol: string
  decimals: number
}

export class Wallets {
  public wallet: Wallet | null = null
  private walletClient: WalletClient
  private rpcClient: RpcClient
  private readonly orgHost: string

  constructor(client: Client) {
    this.walletClient = new WalletClient(client)
    this.rpcClient = new RpcClient(client)
    this.orgHost = client.getOrgHost()
  }

  async createWallet(userPassword: string): Promise<void> {
    const firebaseId = await LocalForage.get<string>(
      `${this.orgHost}:firebaseId`
    )
    if (!firebaseId) {
      throw new Error('FirebaseId not found. May not be logged in yet')
    }

    try {
      const mnemonic = generateMnemonic()
      const seed = await mnemonicToSeed(mnemonic)
      const wallet = new Wallet(seed.slice(0, 32).toString('hex'))

      const privateKeyHex = wallet.privateKey
      const publicKey = wallet.signingKey.publicKey

      const shares = await Secrets.split(privateKeyHex, 3, 2)

      /**
       * Save on server's DB in simple encrypted text.
       */
      const share1 = shares[0]

      /**
       * It will be encrypted using two passwords(userPassword and firebaseId), and be saved on the localForage.
       * To decrypt, need userPassword and firebaseId parsed from session(JWT).
       * Decrypted share2 will be saved on SessionStorage, which will not be removed until user close the browser, or session expires(for now 24 hours).
       */
      const share2 = shares[1]

      /**
       * It will be encrypted using two passwords(userPassword and firebaseId), and be saved on server's DB(later on Vault).
       * To decrypt, need userPassword and firebaseId parsed from session(JWT).
       */
      const share3 = shares[2]

      const encryptedShare2 = this.encryptShare(
        share2,
        userPassword,
        firebaseId
      )
      const encryptedShare3 = this.encryptShare(
        share3,
        userPassword,
        firebaseId
      )

      await LocalForage.save(`${this.orgHost}:encryptedShare2`, encryptedShare2)

      const request: CreateWalletRequest = {
        address: wallet.address,
        publicKey: publicKey,
        share1: share1,
        encryptedShare3: encryptedShare3
      }
      await this.walletClient.createWallet(request)
      await LocalForage.delete(`${this.orgHost}:isNewUser`)
    } catch (error) {
      console.error('Error during creating wallet:', error)
      throw error
    }
  }

  async retrieveWallet(userPassword?: string): Promise<void> {
    const firebaseId = await LocalForage.get<string>(
      `${this.orgHost}:firebaseId`
    )
    if (!firebaseId) {
      throw new Error('FirebaseId not found. May not be logged in yet')
    }

    const accessToken = await LocalForage.get<string>(
      `${this.orgHost}:accessToken`
    )
    const response = await this.walletClient.getWallet()

    const exp = Jwt.parse(accessToken!)?.exp! * 1000

    let share2 = await LocalForage.get<string>(`${this.orgHost}:share2`)

    if (!share2) {
      const encryptedShare2 = await LocalForage.get<string>(
        `${this.orgHost}:encryptedShare2`
      )

      if (!firebaseId) {
        throw new Error('Login first to get the wallet')
      }
      if (!userPassword) {
        throw new Error('User password needs to be provided')
      }

      if (encryptedShare2) {
        console.log('Retrieve using existing encryptedShare2')
        share2 = this.decryptShare(encryptedShare2, userPassword!, firebaseId!)
        await LocalForage.save(
          `${this.orgHost}:share2`,
          share2,
          exp // same as access token
        )
      } else {
        console.log(
          'Signing in to a new device/browser. Decrypting encryptedShare3'
        )
        this.wallet = await this.refreshWallet(
          exp,
          response!,
          userPassword!,
          firebaseId!
        )
      }
    }

    const privateKey = await Secrets.combine([response!.share1, share2!])
    const wallet = new Wallet(privateKey)
    if (wallet.address.toLowerCase() !== response!.address.toLowerCase()) {
      console.log(
        'Key refresh detected from other device/browser. Refreshing key for this device/browser.'
      )
      if (!firebaseId) {
        throw new Error('Login first to get the wallet')
      }
      if (!userPassword) {
        throw new Error('User password needs to be provided')
      }

      await LocalForage.save(`${this.orgHost}:walletAddress`, response!.address)
      this.wallet = await this.refreshWallet(
        exp,
        response!,
        userPassword!,
        firebaseId!
      )
    }
    this.wallet = wallet
  }

  async getBalance(chainId: number): Promise<string> {
    if (this.wallet === null) {
      throw new Error('Wallet not found. You must retrieve wallet first')
    }

    const response = await this.rpcClient.getBalance(
      chainId,
      this.wallet.address
    )
    if (response.error) {
      throw new Error(response.error.message)
    }
    return response.result
  }

  async sendTransction(
    nodeUrl: string,
    chainId: number,
    amount: string,
    to: string,
    coin: Coin,
    nonce?: number,
    gasLimit?: bigint,
    gasPrice?: string
  ): Promise<string> {
    if (coin.contractAddress != '0x0') {
      return await this.sendTokenTransaction(
        nodeUrl,
        chainId,
        amount,
        to,
        coin,
        nonce,
        gasLimit,
        gasPrice
      )
    }
    return await this.sendCoinTransction(
      nodeUrl,
      chainId,
      amount,
      to,
      nonce,
      gasLimit,
      gasPrice
    )
  }

  private async sendCoinTransction(
    nodeUrl: string,
    chainId: number,
    amount: string,
    to: string,
    nonce?: number,
    gasLimit?: bigint,
    gasPrice?: string
  ): Promise<string> {
    if (this.wallet === null) {
      throw new Error('Wallet not found. You must retrieve wallet first')
    }

    const web3 = new Web3(nodeUrl)
    const weiAmount = web3.utils.toWei(amount, 'ether')
    if (!nonce) {
      const nonceResponse = await this.rpcClient.getTransactionCount(
        chainId,
        this.wallet.address
      )
      if (nonceResponse.error) {
        throw new Error(nonceResponse.error.message)
      }
      nonce = nonceResponse.result
    }

    if (!gasPrice) {
      const gasPriceResponse = await this.rpcClient.getGasPrice(chainId)
      if (gasPriceResponse.error) {
        throw new Error(gasPriceResponse.error.message)
      }
      gasPrice = gasPriceResponse.result
    }

    const estimatedGas: bigint =
      gasLimit ??
      (await this.estimateGas(web3, this.wallet.address, to, weiAmount)) *
        toBigInt(2) // add extra gas limit to prevent out of gas error
    const signedTx = await this.wallet.signTransaction({
      nonce: nonce,
      gasPrice: gasPrice,
      gasLimit: web3.utils.toHex(estimatedGas),
      to: to,
      value: weiAmount,
      data: '0x',
      chainId: chainId
    })

    const txResponse = await this.rpcClient.sendRawTransaction(
      chainId,
      signedTx
    )
    if (txResponse.error) {
      throw new Error(txResponse.error.message)
    }
    return txResponse.result
  }

  private async sendTokenTransaction(
    nodeUrl: string,
    chainId: number,
    amount: string,
    to: string,
    coin: Coin,
    nonce?: number,
    gasLimit?: bigint,
    gasPrice?: string
  ): Promise<string> {
    if (this.wallet === null) {
      throw new Error('Wallet not found. You must retrieve wallet first')
    }

    const web3 = new Web3(nodeUrl)
    const tokenContract = new web3.eth.Contract(ERC20_ABI, coin.contractAddress)

    const tokenAmount = web3.utils.toWei(amount.toString(), 'ether')

    if (!nonce) {
      const nonceResponse = await this.rpcClient.getTransactionCount(
        chainId,
        this.wallet.address
      )
      if (nonceResponse.error) {
        throw new Error(nonceResponse.error.message)
      }
      nonce = nonceResponse.result
    }

    if (!gasPrice) {
      const gasPriceResponse = await this.rpcClient.getGasPrice(chainId)
      if (gasPriceResponse.error) {
        throw new Error(gasPriceResponse.error.message)
      }
      gasPrice = gasPriceResponse.result
    }

    const data = tokenContract.methods.transfer(to, tokenAmount).encodeABI()

    let estimatedGas: bigint =
      gasLimit ??
      (await this.estimateGas(
        web3,
        this.wallet.address,
        to,
        (parseInt(amount) * Math.pow(10, coin.decimals)).toString(),
        'erc20',
        coin.contractAddress
      )) * toBigInt(2) // add extra gas limit to prevent out of gas error
    const signedTx = await this.wallet.signTransaction({
      nonce: nonce,
      gasPrice: gasPrice,
      gasLimit: web3.utils.toHex(estimatedGas),
      to: coin.contractAddress,
      value: '0x0',
      data: data,
      chainId: chainId
    })

    const txResponse = await this.rpcClient.sendRawTransaction(
      chainId,
      signedTx
    )
    if (txResponse.error) {
      throw new Error(txResponse.error.message)
    }
    return txResponse.result
  }

  async getTransactionStatus(
    nodeUrl: string,
    chainId: number,
    txHash: string
  ): Promise<TransactionStatus> {
    const receiptResponse = await this.rpcClient.getTransactionReceipt(
      chainId,
      txHash
    )
    if (receiptResponse.error) {
      throw new Error(receiptResponse.error.message)
    }

    const receipt = receiptResponse.result
    if (receipt) {
      return receipt.status === '0x1'
        ? TransactionStatus.SUCCESS
        : TransactionStatus.FAILURE
    }
    return TransactionStatus.PENDING
  }

  public async getCoinInfo(
    nodeUrl: string,
    contractAddress: string
  ): Promise<ERC20Info> {
    try {
      const web3 = new Web3(nodeUrl)
      const tokenContract = new web3.eth.Contract(ERC20_ABI, contractAddress)
      return {
        name: await tokenContract.methods.name().call(),
        symbol: await tokenContract.methods.symbol().call(),
        decimals: parseInt(
          BigInt(await tokenContract.methods.decimals().call()).toString()
        )
      }
    } catch (e) {
      if ((e as Error).message.includes("Returned values aren't valid")) {
        throw new Error('Not a valid ERC20 token')
      }
      throw e
    }
  }

  private async refreshWallet(
    exp: number,
    wallet: domain.Wallet,
    userPassword: string,
    firebaseId: string
  ): Promise<Wallet> {
    const share3 = this.decryptShare(
      wallet.encryptedShare3,
      userPassword,
      firebaseId
    )
    const privateKey = await Secrets.combine([wallet.share1, share3])
    const newShares = await Secrets.split(privateKey, 3, 2)
    const newShare2 = newShares[1]
    console.log('Updating with new key')
    await this.walletClient.updateWalletKey({
      share1: newShares[0],
      encryptedShare3: this.encryptShare(
        newShares[2],
        userPassword!,
        firebaseId!
      )
    })
    await LocalForage.save(`${this.orgHost}:share2`, newShare2, exp)
    await LocalForage.save(
      `${this.orgHost}:encryptedShare2`,
      this.encryptShare(newShare2, userPassword!, firebaseId!)
    )
    await LocalForage.save(`${this.orgHost}:walletAddress`, wallet!.address)
    return new Wallet(privateKey)
  }

  private decryptShare(
    encryptedShare: string,
    password: string,
    salt: string
  ): string {
    try {
      const [ivHex, encrypted] = encryptedShare.split(':')
      const iv = Buffer.from(ivHex, 'hex')
      const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512')
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } catch (e) {
      const error = e as Error
      if (error.message === 'unable to decrypt data') {
        throw new Error('Wrong password')
      }
      throw e
    }
  }

  private encryptShare(share: string, password: string, salt: string): string {
    try {
      const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512')
      const iv: Buffer = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
      let encrypted = cipher.update(share, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      return `${iv.toString('hex')}:${encrypted}`
    } catch (e) {
      console.error('Error during encrypting share:', e)
      throw e
    }
  }

  private async estimateGas(
    web3: Web3,
    fromAddress: string,
    toAddress: string,
    amount: string, // should be in wei
    txType?: 'erc20' | 'coin',
    tokenAddress?: string
  ) {
    try {
      if (txType === 'erc20' && tokenAddress) {
        const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenAddress)
        return await tokenContract.methods
          .transfer(toAddress, amount)
          .estimateGas({ from: fromAddress })
      }

      return await web3.eth.estimateGas({
        from: fromAddress,
        to: toAddress,
        value: amount
      })
    } catch (error) {
      console.error('Gas estimation failed:', error)
      throw error
    }
  }
}
