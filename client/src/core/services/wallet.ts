import { Wallet } from 'ethers'
import { generateMnemonic, mnemonicToSeed } from 'bip39'
import { WalletClient } from '../../clients/api/wallets'
import { Secrets } from '../../utils/secrets'
import { Crypto } from '../../utils/crypto'
import { LocalForage } from '../../utils/storage'
import { WalletInfo, NetworkInfo } from '../../types'

export class WalletService {
  constructor(
    private readonly walletClient: WalletClient,
    private readonly orgHost: string
  ) {}

  async create(password: string) {
    const firebaseId = await LocalForage.get<string>(
      `${this.orgHost}:firebaseId`
    )
    if (!firebaseId) throw new Error('Not logged in')

    const mnemonic = generateMnemonic()
    const seed = await mnemonicToSeed(mnemonic)
    const wallet = new Wallet(seed.slice(0, 32).toString('hex'))

    const shares = await Secrets.split(wallet.privateKey, 3, 2)
    const [share1, share2, share3] = shares

    const encryptedShare2 = Crypto.encryptShare(share2, password, firebaseId)
    const encryptedShare3 = Crypto.encryptShare(share3, password, firebaseId)

    await LocalForage.save(`${this.orgHost}:encryptedShare2`, encryptedShare2)

    await this.walletClient.createWallet({
      address: wallet.address,
      publicKey: wallet.signingKey.publicKey,
      share1,
      encryptedShare3,
    })

    return { wallet: await this.getInfo() }
  }

  async getInfo(): Promise<WalletInfo> {
    // 임시로 빈 객체 반환
    return {
      address: '',
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
