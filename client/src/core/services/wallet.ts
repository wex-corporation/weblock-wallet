import { Wallet } from 'ethers'
import { generateMnemonic, mnemonicToSeed } from 'bip39'
import { WalletClient } from '../../clients/api/wallets'
import { Secrets } from '../../utils/secrets'
import { Crypto } from '../../utils/crypto'
import { LocalForage } from '../../utils/storage'
import { WalletInfo, NetworkInfo, SDKError, SDKErrorCode } from '../../types'

export class WalletService {
  private walletAddress: string | null = null

  constructor(
    private readonly walletClient: WalletClient,
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
}
