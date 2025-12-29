import { Wallet, Interface } from 'ethers'
import { generateMnemonic, mnemonicToSeed } from 'bip39'
import { WalletClient } from '../../clients/api/wallets'
import { Secrets } from '../../utils/secrets'
import { Crypto } from '../../utils/crypto'
import { LocalForage } from '../../utils/storage'
import {
  SDKError,
  SDKErrorCode,
  SendTransactionParams,
  TokenBalance,
  Transaction,
  TransactionStatus,
} from '../../types'
import { RpcClient } from '../../clients/api/rpcs'
import { RpcMethod } from '../../clients/types'
import { NetworkService } from '../../core/services/network'
import { TokenAmount } from '../../utils/numbers'
import { DECIMALS } from '../../utils/numbers'
import * as nodeCrypto from 'crypto'

// ERC-20 ABI 중 balanceOf, decimals, symbol 만 정의
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

const STORAGE_KEYS = {
  walletAddress: (orgHost: string) => `${orgHost}:walletAddress`,
  share2: (orgHost: string) => `${orgHost}:share2`,
  encryptedShare2: (orgHost: string) => `${orgHost}:encryptedShare2`,
  encryptedShare2Device: (orgHost: string) =>
    `${orgHost}:encryptedShare2_device`,
  deviceSecret: (orgHost: string) => `${orgHost}:deviceSecret`,
  firebaseId: (orgHost: string) => `${orgHost}:firebaseId`,
  accessToken: (orgHost: string) => `${orgHost}:accessToken`,
  isNewUser: (orgHost: string) => `${orgHost}:isNewUser`,
}

export class WalletService {
  private walletAddress: string | null = null

  /**
   * Wallet PIN/password mismatch handling.
   */
  private isInvalidPasswordError(error: unknown): boolean {
    if (!error) return false

    if (error instanceof Error) {
      const msg = (error.message || '').toLowerCase()
      return (
        msg.includes('wrong password') ||
        msg.includes('unable to decrypt') ||
        msg.includes('bad decrypt') ||
        msg.includes('invalid key')
      )
    }

    try {
      const msg = String((error as any)?.message ?? '').toLowerCase()
      return (
        msg.includes('wrong password') ||
        msg.includes('unable to decrypt') ||
        msg.includes('bad decrypt') ||
        msg.includes('invalid key')
      )
    } catch {
      return false
    }
  }

  private isSixDigitPin(pin: string): boolean {
    return /^[0-9]{6}$/.test(pin)
  }

  /**
   * deviceSecret은 "PIN과 무관한 로컬 복구용 비밀값"입니다.
   * - 같은 디바이스에서만 PIN reset이 가능하도록 하는 역할
   * - 서버에는 절대 전달하지 않습니다.
   */
  private async getOrCreateDeviceSecret(): Promise<string> {
    const key = STORAGE_KEYS.deviceSecret(this.orgHost)
    const existing = await LocalForage.get<string>(key)
    if (existing) return existing

    const secret = nodeCrypto.randomBytes(32).toString('hex')
    await LocalForage.save(key, secret)
    return secret
  }

  private async ensureDeviceEncryptedShare2(
    share2Plain: string,
    firebaseId: string
  ): Promise<void> {
    const encryptedKey = STORAGE_KEYS.encryptedShare2Device(this.orgHost)
    const existing = await LocalForage.get<string>(encryptedKey)
    if (existing) return

    const deviceSecret = await this.getOrCreateDeviceSecret()
    const encrypted = Crypto.encryptShare(share2Plain, deviceSecret, firebaseId)
    await LocalForage.save(encryptedKey, encrypted)
  }

  constructor(
    private readonly walletClient: WalletClient,
    private readonly rpcClient: RpcClient,
    private readonly orgHost: string,
    private readonly networkService: NetworkService
  ) {}

  async getAddress(): Promise<string> {
    try {
      if (this.walletAddress) {
        return this.walletAddress
      }

      const savedAddress = await LocalForage.get<string>(
        STORAGE_KEYS.walletAddress(this.orgHost)
      )
      if (savedAddress) {
        this.walletAddress = savedAddress
        return savedAddress
      }

      const walletInfo = await this.walletClient.getWallet()
      if (walletInfo?.address) {
        this.walletAddress = walletInfo.address
        await LocalForage.save(
          STORAGE_KEYS.walletAddress(this.orgHost),
          walletInfo.address
        )
        return walletInfo.address
      }

      throw new SDKError('Wallet not found', SDKErrorCode.WALLET_NOT_FOUND)
    } catch (error) {
      throw new SDKError(
        'Failed to get wallet address',
        SDKErrorCode.WALLET_NOT_FOUND,
        error
      )
    }
  }

  async create(password: string) {
    try {
      const firebaseId = await LocalForage.get<string>(
        STORAGE_KEYS.firebaseId(this.orgHost)
      )
      console.log('1. FirebaseId:', firebaseId)

      if (!firebaseId) {
        throw new SDKError('Not logged in', SDKErrorCode.AUTH_REQUIRED)
      }

      if (!password) {
        throw new SDKError('Password is required', SDKErrorCode.INVALID_PARAMS)
      }

      if (!this.isSixDigitPin(password)) {
        throw new SDKError(
          'PIN must be a 6-digit number',
          SDKErrorCode.INVALID_PARAMS
        )
      }

      const isNewUser = await LocalForage.get<boolean>(
        STORAGE_KEYS.isNewUser(this.orgHost)
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

      console.log('6. Encrypting shares...')
      const encryptedShare2 = Crypto.encryptShare(share2, password, firebaseId)
      const encryptedShare3 = Crypto.encryptShare(share3, password, firebaseId)

      console.log('8. Saving encryptedShare2 to LocalForage...')
      await LocalForage.save(
        STORAGE_KEYS.encryptedShare2(this.orgHost),
        encryptedShare2
      )

      // NEW: device recovery용 encryptedShare2_device 저장
      await this.ensureDeviceEncryptedShare2(share2, firebaseId)

      console.log('10. Creating wallet on server...')
      await this.walletClient.createWallet({
        address: wallet.address,
        publicKey: wallet.signingKey.publicKey,
        share1,
        encryptedShare3,
      })

      this.walletAddress = wallet.address
      await LocalForage.save(
        STORAGE_KEYS.walletAddress(this.orgHost),
        wallet.address
      )

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

  async retrieveWallet(password: string): Promise<string> {
    try {
      const accessToken = await LocalForage.get<string>(
        STORAGE_KEYS.accessToken(this.orgHost)
      )
      if (!accessToken) {
        throw new SDKError('Access token not found', SDKErrorCode.AUTH_REQUIRED)
      }

      const firebaseId = await LocalForage.get<string>(
        STORAGE_KEYS.firebaseId(this.orgHost)
      )
      if (!firebaseId) {
        throw new SDKError('Not logged in', SDKErrorCode.AUTH_REQUIRED)
      }

      if (!this.isSixDigitPin(password)) {
        throw new SDKError(
          'PIN must be a 6-digit number',
          SDKErrorCode.INVALID_PARAMS
        )
      }

      const decryptShareOrThrow = (encryptedShare: string): string => {
        try {
          return Crypto.decryptShare(encryptedShare, password, firebaseId)
        } catch (e) {
          if (this.isInvalidPasswordError(e)) {
            throw new SDKError(
              'Incorrect PIN code',
              SDKErrorCode.INVALID_PASSWORD,
              e
            )
          }
          throw e
        }
      }

      const walletInfo = await this.walletClient.getWallet()

      let share2 = await LocalForage.get<string>(
        STORAGE_KEYS.share2(this.orgHost)
      )

      if (!share2) {
        const encryptedShare2 = await LocalForage.get<string>(
          STORAGE_KEYS.encryptedShare2(this.orgHost)
        )
        if (encryptedShare2) {
          share2 = decryptShareOrThrow(encryptedShare2)
          await LocalForage.save(STORAGE_KEYS.share2(this.orgHost), share2)
        } else {
          // encryptedShare2가 없으면 share3 기반 복구 (기존 로직)
          const share3 = decryptShareOrThrow(walletInfo.encryptedShare3)
          const privateKey = await Secrets.combine([walletInfo.share1, share3])
          const wallet = new Wallet(privateKey)

          const newShares = await Secrets.split(wallet.privateKey, 3, 2)
          const [newShare1, newShare2, newShare3] = newShares

          await this.walletClient.updateWalletKey({
            share1: newShare1,
            encryptedShare3: Crypto.encryptShare(
              newShare3,
              password,
              firebaseId
            ),
          })

          await LocalForage.save(STORAGE_KEYS.share2(this.orgHost), newShare2)
          await LocalForage.save(
            STORAGE_KEYS.encryptedShare2(this.orgHost),
            Crypto.encryptShare(newShare2, password, firebaseId)
          )

          // NEW: device recovery material도 갱신
          await this.ensureDeviceEncryptedShare2(newShare2, firebaseId)

          this.walletAddress = wallet.address
          await LocalForage.save(
            STORAGE_KEYS.walletAddress(this.orgHost),
            wallet.address
          )
          await LocalForage.delete(STORAGE_KEYS.share2(this.orgHost))
          return wallet.address
        }
      }

      const privateKey = await Secrets.combine([walletInfo.share1, share2])
      const wallet = new Wallet(privateKey)

      // NEW: device recovery material 보장
      await this.ensureDeviceEncryptedShare2(share2, firebaseId)

      this.walletAddress = wallet.address
      await LocalForage.save(
        STORAGE_KEYS.walletAddress(this.orgHost),
        wallet.address
      )
      await LocalForage.delete(STORAGE_KEYS.share2(this.orgHost))
      return wallet.address
    } catch (error) {
      this.walletAddress = null
      await LocalForage.delete(STORAGE_KEYS.share2(this.orgHost))
      console.error('Error in retrieveWallet:', error)
      if (error instanceof SDKError) throw error
      throw new SDKError(
        'Failed to retrieve wallet',
        SDKErrorCode.WALLET_RECOVERY_FAILED,
        error
      )
    }
  }

  /**
   * NEW: PIN reset (프라이빗키/주소 유지)
   * - 같은 디바이스에 남아있는 encryptedShare2_device를 이용
   * - 서버는 PATCH /v1/wallets/keys 로 share1 / encryptedShare3 만 업데이트
   */
  async resetPin(newPassword: string): Promise<string> {
    try {
      const accessToken = await LocalForage.get<string>(
        STORAGE_KEYS.accessToken(this.orgHost)
      )
      if (!accessToken) {
        throw new SDKError('Access token not found', SDKErrorCode.AUTH_REQUIRED)
      }

      const firebaseId = await LocalForage.get<string>(
        STORAGE_KEYS.firebaseId(this.orgHost)
      )
      if (!firebaseId) {
        throw new SDKError('Not logged in', SDKErrorCode.AUTH_REQUIRED)
      }

      if (!newPassword || !this.isSixDigitPin(newPassword)) {
        throw new SDKError(
          'PIN must be a 6-digit number',
          SDKErrorCode.INVALID_PARAMS
        )
      }

      const encryptedDevice = await LocalForage.get<string>(
        STORAGE_KEYS.encryptedShare2Device(this.orgHost)
      )
      if (!encryptedDevice) {
        throw new SDKError(
          'PIN reset is not available on this device',
          SDKErrorCode.RECOVERY_NOT_AVAILABLE
        )
      }

      const deviceSecret = await LocalForage.get<string>(
        STORAGE_KEYS.deviceSecret(this.orgHost)
      )
      if (!deviceSecret) {
        throw new SDKError(
          'PIN reset is not available on this device',
          SDKErrorCode.RECOVERY_NOT_AVAILABLE
        )
      }

      let share2: string
      try {
        share2 = Crypto.decryptShare(encryptedDevice, deviceSecret, firebaseId)
      } catch (e) {
        throw new SDKError(
          'PIN reset is not available on this device',
          SDKErrorCode.RECOVERY_NOT_AVAILABLE,
          e
        )
      }

      const walletInfo = await this.walletClient.getWallet()

      // private key 복원 (주소 유지)
      const privateKey = await Secrets.combine([walletInfo.share1, share2])
      const wallet = new Wallet(privateKey)

      // 새 PIN으로 shares 재발급/재암호화 (프라이빗키는 동일)
      const newShares = await Secrets.split(wallet.privateKey, 3, 2)
      const [newShare1, newShare2, newShare3] = newShares

      // 서버 업데이트: share1 + encryptedShare3(새 PIN)
      await this.walletClient.updateWalletKey({
        share1: newShare1,
        encryptedShare3: Crypto.encryptShare(
          newShare3,
          newPassword,
          firebaseId
        ),
      })

      // 로컬 업데이트: encryptedShare2(새 PIN) + encryptedShare2_device(유지/갱신)
      await LocalForage.save(
        STORAGE_KEYS.encryptedShare2(this.orgHost),
        Crypto.encryptShare(newShare2, newPassword, firebaseId)
      )

      const newEncryptedDevice = Crypto.encryptShare(
        newShare2,
        deviceSecret,
        firebaseId
      )
      await LocalForage.save(
        STORAGE_KEYS.encryptedShare2Device(this.orgHost),
        newEncryptedDevice
      )

      // 지갑 주소 캐시 갱신
      this.walletAddress = wallet.address
      await LocalForage.save(
        STORAGE_KEYS.walletAddress(this.orgHost),
        wallet.address
      )

      // share2 평문은 항상 제거
      await LocalForage.delete(STORAGE_KEYS.share2(this.orgHost))

      return wallet.address
    } catch (error) {
      console.error('Error in resetPin:', error)
      if (error instanceof SDKError) throw error
      throw new SDKError(
        'Failed to reset PIN',
        SDKErrorCode.PIN_RESET_FAILED,
        error
      )
    }
  }

  async clearWalletState(): Promise<void> {
    this.walletAddress = null
    await LocalForage.delete(STORAGE_KEYS.walletAddress(this.orgHost))
    await LocalForage.delete(STORAGE_KEYS.share2(this.orgHost))
    await LocalForage.delete(STORAGE_KEYS.encryptedShare2(this.orgHost))

    // NEW
    await LocalForage.delete(STORAGE_KEYS.encryptedShare2Device(this.orgHost))
    await LocalForage.delete(STORAGE_KEYS.deviceSecret(this.orgHost))
  }

  async getBalance(address: string, chainId: number): Promise<TokenBalance> {
    const response = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_GET_BALANCE,
      params: [address, 'latest'],
    })

    const network = await this.networkService.getCurrentNetwork()
    const decimals = network?.decimals || DECIMALS.ETH

    return {
      raw: response.result,
      formatted: TokenAmount.format(response.result, decimals),
      decimals,
      symbol: network?.symbol || 'ETH',
    }
  }

  async getTokenBalance(
    tokenAddress: string,
    walletAddress: string,
    chainId: number
  ): Promise<TokenBalance> {
    const erc20 = new Interface(ERC20_ABI)

    const data = erc20.encodeFunctionData('balanceOf', [walletAddress])

    const rawBalance = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_CALL,
      params: [
        {
          to: tokenAddress,
          data,
        },
        'latest',
      ],
    })

    const decimalsData = erc20.encodeFunctionData('decimals', [])
    const decimalsRes = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_CALL,
      params: [
        {
          to: tokenAddress,
          data: decimalsData,
        },
        'latest',
      ],
    })
    const decimals = parseInt(decimalsRes.result, 16)

    const symbolData = erc20.encodeFunctionData('symbol', [])
    const symbolRes = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_CALL,
      params: [
        {
          to: tokenAddress,
          data: symbolData,
        },
        'latest',
      ],
    })
    const symbol = erc20.decodeFunctionResult('symbol', symbolRes.result)[0]

    return {
      raw: rawBalance.result,
      formatted: TokenAmount.format(rawBalance.result, decimals),
      decimals,
      symbol,
    }
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

  async getLatestTransaction(
    address: string,
    chainId: number
  ): Promise<Transaction | undefined> {
    try {
      const nonce = await this.rpcClient.sendRpc({
        chainId,
        method: RpcMethod.ETH_GET_TRANSACTION_COUNT,
        params: [address, 'latest'],
      })

      if (!nonce.result || nonce.result === '0x0') {
        return undefined
      }
      return {
        hash: '',
        status: TransactionStatus.SUCCESS,
        timestamp: Date.now(),
        value: '0',
      } as Transaction
    } catch (error) {
      console.error('Failed to get latest transaction:', error)
      return undefined
    }
  }

  async sendTransaction(params: SendTransactionParams): Promise<string> {
    try {
      const from = await this.getAddress()
      if (!from) {
        throw new SDKError('Wallet not found', SDKErrorCode.WALLET_NOT_FOUND)
      }

      const [share1, share2] = await Promise.all([
        this.walletClient.getWallet().then((wallet) => wallet.share1),
        LocalForage.get<string>(STORAGE_KEYS.share2(this.orgHost)),
      ])

      if (!share1 || !share2) {
        throw new SDKError(
          'Wallet shares not found',
          SDKErrorCode.WALLET_NOT_FOUND
        )
      }

      const privateKey = await Secrets.combine([share1, share2])
      const wallet = new Wallet(privateKey)

      const nonce =
        params.nonce ?? (await this.getTransactionCount(from, params.chainId))
      const gasPrice =
        params.gasPrice ?? (await this.getGasPrice(params.chainId))

      const signedTx = await wallet.signTransaction({
        to: params.to,
        value: params.value,
        data: params.data || '0x',
        chainId: params.chainId,
        nonce,
        gasPrice,
        gasLimit: params.gasLimit,
      })

      return this.sendRawTransaction(signedTx, params.chainId)
    } catch (error) {
      throw new SDKError(
        'Transaction failed',
        SDKErrorCode.TRANSACTION_FAILED,
        error
      )
    }
  }
}
