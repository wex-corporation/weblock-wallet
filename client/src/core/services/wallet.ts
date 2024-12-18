import { Wallet } from 'ethers'
import { generateMnemonic, mnemonicToSeed } from 'bip39'
import { WalletClient } from '../../clients/api/wallets'
import { Secrets } from '../../utils/secrets'
import { Crypto } from '../../utils/crypto'
import { LocalForage } from '../../utils/storage'
import { WalletInfo, NetworkInfo, SDKError, SDKErrorCode } from '../../types'
import { RpcClient } from '../../clients/api/rpcs'
import { RpcMethod } from '../../clients/types'
import { Jwt } from '../../utils/jwt'

export class WalletService {
  private walletAddress: string | null = null

  constructor(
    private readonly walletClient: WalletClient,
    private readonly rpcClient: RpcClient,
    private readonly orgHost: string
  ) {}

  async create(password: string) {
    try {
      const firebaseId = await LocalForage.get<string>(
        `${this.orgHost}:firebaseId`
      )
      console.log('1. FirebaseId:', firebaseId)

      if (!firebaseId) {
        throw new SDKError('Not logged in', SDKErrorCode.AUTH_REQUIRED)
      }

      if (!password) {
        throw new SDKError('Password is required', SDKErrorCode.INVALID_PARAMS)
      }

      const isNewUser = await LocalForage.get<boolean>(
        `${this.orgHost}:isNewUser`
      )
      if (!isNewUser) {
        throw new SDKError(
          'Wallet already exists',
          SDKErrorCode.WALLET_ALREADY_EXISTS
        )
      }

      console.log('2. Generating wallet...')
      const mnemonic = generateMnemonic()
      const seed = await mnemonicToSeed(mnemonic)
      const wallet = new Wallet(seed.slice(0, 32).toString('hex'))
      console.log('3. Wallet created:', {
        address: wallet.address,
        publicKey: wallet.signingKey.publicKey,
      })

      console.log('4. Splitting private key...')
      const shares = await Secrets.split(wallet.privateKey, 3, 2)
      const [share1, share2, share3] = shares
      console.log('5. Shares created:', {
        share1Length: share1.length,
        share2Length: share2.length,
        share3Length: share3.length,
      })

      console.log('6. Encrypting shares...')
      const encryptedShare2 = Crypto.encryptShare(share2, password, firebaseId)
      const encryptedShare3 = Crypto.encryptShare(share3, password, firebaseId)
      console.log('7. Shares encrypted:', {
        encryptedShare2Length: encryptedShare2.length,
        encryptedShare3Length: encryptedShare3.length,
      })

      console.log('8. Saving encryptedShare2 to LocalForage...')
      await LocalForage.save(`${this.orgHost}:encryptedShare2`, encryptedShare2)
      console.log('9. encryptedShare2 saved')

      console.log('10. Creating wallet on server...')
      await this.walletClient.createWallet({
        address: wallet.address,
        publicKey: wallet.signingKey.publicKey,
        share1,
        encryptedShare3,
      })
      console.log('11. Wallet created on server')

      this.walletAddress = wallet.address
      console.log('12. Final wallet address:', this.walletAddress)
      return wallet.address
    } catch (error) {
      console.error('Error in create wallet:', error)
      if (error instanceof SDKError) throw error
      throw new SDKError(
        'Failed to create wallet',
        SDKErrorCode.WALLET_CREATION_FAILED,
        error
      )
    }
  }

  async getInfo(): Promise<WalletInfo> {
    return {
      address: this.walletAddress || '',
      network: {
        current: {} as NetworkInfo,
        available: [],
      },
      assets: {
        native: {
          symbol: '',
          balance: '0',
          decimals: 18,
        },
        tokens: [],
        nfts: [],
      },
      recentTransactions: [],
    }
  }

  async recover(password: string) {
    return { wallet: await this.getInfo() }
  }

  async retrieveWallet(password: string): Promise<string> {
    try {
      const accessToken = await LocalForage.get<string>(
        `${this.orgHost}:accessToken`
      )
      if (!accessToken) {
        throw new SDKError('Access token not found', SDKErrorCode.AUTH_REQUIRED)
      }

      const exp = Jwt.parse(accessToken)?.exp

      console.log('1. Checking login status...')
      const firebaseId = await LocalForage.get<string>(
        `${this.orgHost}:firebaseId`
      )
      if (!firebaseId) {
        throw new SDKError('Not logged in', SDKErrorCode.AUTH_REQUIRED)
      }

      console.log('2. Getting wallet info from server...')
      const walletInfo = await this.walletClient.getWallet()
      console.log('3. Wallet info received:', { address: walletInfo.address })

      console.log('4. Checking for existing share2...')
      let share2 = await LocalForage.get<string>(`${this.orgHost}:share2`)

      if (!share2) {
        console.log('5. No share2 found, checking encryptedShare2...')
        const encryptedShare2 = await LocalForage.get<string>(
          `${this.orgHost}:encryptedShare2`
        )
        if (!password) {
          throw new SDKError(
            'Password is required',
            SDKErrorCode.INVALID_PARAMS
          )
        }

        if (encryptedShare2) {
          console.log('6. Found encryptedShare2, decrypting...')
          share2 = Crypto.decryptShare(encryptedShare2, password, firebaseId)
          console.log('7. Saving decrypted share2...')
          await LocalForage.save(`${this.orgHost}:share2`, share2, exp)
        } else {
          console.log('8. No encryptedShare2, recovering using share3...')
          const share3 = Crypto.decryptShare(
            walletInfo.encryptedShare3,
            password,
            firebaseId
          )
          console.log('9. Share3 decrypted, combining with share1...')
          const privateKey = await Secrets.combine([walletInfo.share1, share3])
          const wallet = new Wallet(privateKey)

          console.log('10. Generating new shares...')
          const newShares = await Secrets.split(wallet.privateKey, 3, 2)
          const [newShare1, newShare2, newShare3] = newShares
          console.log('11. New shares generated')

          console.log('12. Updating wallet keys on server...')
          await this.walletClient.updateWalletKey({
            share1: newShare1,
            encryptedShare3: Crypto.encryptShare(
              newShare3,
              password,
              firebaseId
            ),
          })

          console.log('13. Saving new shares locally...')
          await LocalForage.save(`${this.orgHost}:share2`, newShare2)
          await LocalForage.save(
            `${this.orgHost}:encryptedShare2`,
            Crypto.encryptShare(newShare2, password, firebaseId)
          )

          console.log('14. Wallet recovered with share3:', wallet.address)
          return wallet.address
        }
      }

      console.log('15. Combining share1 and share2...')
      const privateKey = await Secrets.combine([walletInfo.share1, share2])
      const wallet = new Wallet(privateKey)
      this.walletAddress = wallet.address
      console.log('16. Wallet retrieved successfully:', wallet.address)
      return wallet.address
    } catch (error) {
      console.error('Error in retrieveWallet:', error)
      if (error instanceof SDKError) throw error
      throw new SDKError(
        'Failed to retrieve wallet',
        SDKErrorCode.WALLET_RECOVERY_FAILED,
        error
      )
    }
  }
  async getBalance(address: string, chainId: number): Promise<string> {
    const response = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_GET_BALANCE,
      params: [address, 'latest'],
    })
    return response.result
  }

  async getTransactionCount(address: string, chainId: number): Promise<number> {
    const response = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_GET_TRANSACTION_COUNT,
      params: [address, 'latest'],
    })
    return parseInt(response.result, 16)
  }

  async getBlockNumber(chainId: number): Promise<number> {
    const response = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_BLOCK_NUMBER,
      params: [],
    })
    return parseInt(response.result, 16)
  }

  async sendRawTransaction(signedTx: string, chainId: number): Promise<string> {
    const response = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_SEND_RAW_TRANSACTION,
      params: [signedTx],
    })
    return response.result
  }
  async getTransactionReceipt(txHash: string, chainId: number): Promise<any> {
    const response = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_GET_TRANSACTION_RECEIPT,
      params: [txHash],
    })
    return response.result
  }

  async getTransaction(txHash: string, chainId: number): Promise<any> {
    const response = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_GET_TRANSACTION_BY_HASH,
      params: [txHash],
    })
    return response.result
  }

  async estimateGas(txParams: any, chainId: number): Promise<number> {
    const response = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_ESTIMATE_GAS,
      params: [txParams],
    })
    return parseInt(response.result, 16)
  }

  async getGasPrice(chainId: number): Promise<string> {
    const response = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_GAS_PRICE,
      params: [],
    })
    return response.result
  }

  async call(
    txParams: any,
    blockParam: string | number = 'latest',
    chainId: number
  ): Promise<string> {
    const response = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_CALL,
      params: [txParams, blockParam],
    })
    return response.result
  }
}
