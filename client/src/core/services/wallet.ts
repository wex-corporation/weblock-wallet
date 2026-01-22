// rwx-wallet/client/src/core/services/wallet.ts

import { Wallet, Interface, Transaction as EthersTx } from 'ethers'
import { generateMnemonic, mnemonicToSeed } from 'bip39'
import * as nodeCrypto from 'crypto'

import { WalletClient } from '../../clients/api/wallets'
import { RpcClient } from '../../clients/api/rpcs'
import { RpcMethod } from '../../clients/types'

import { NetworkService } from '../../core/services/network'

import { Secrets } from '../../utils/secrets'
import { Crypto } from '../../utils/crypto'
import { LocalForage } from '../../utils/storage'
import { TokenAmount, DECIMALS } from '../../utils/numbers'

import {
  SDKError,
  SDKErrorCode,
  SendTransactionParams,
  TokenBalance,
  Transaction,
  TransactionStatus,
} from '../../types'

// ERC-20 ABI (minimal)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

const STORAGE_KEYS = {
  walletAddress: (orgHost: string) => `${orgHost}:walletAddress`,
  share2: (orgHost: string) => `${orgHost}:share2`,
  encryptedShare2: (orgHost: string) => `${orgHost}:encryptedShare2`,

  // User-scoped keys to prevent cross-account mixing on the same device.
  deviceId: (orgHost: string, firebaseId: string) =>
    `${orgHost}:${firebaseId}:deviceId`,
  encryptedShare2Device: (orgHost: string, firebaseId: string) =>
    `${orgHost}:${firebaseId}:encryptedShare2_device`,
  deviceSecret: (orgHost: string, firebaseId: string) =>
    `${orgHost}:${firebaseId}:deviceSecret`,

  // Legacy keys (kept for migration / cleanup)
  encryptedShare2DeviceLegacy: (orgHost: string) =>
    `${orgHost}:encryptedShare2_device`,
  deviceSecretLegacy: (orgHost: string) => `${orgHost}:deviceSecret`,
  deviceIdLegacy: (orgHost: string) => `${orgHost}:deviceId`,

  firebaseId: (orgHost: string) => `${orgHost}:firebaseId`,
  accessToken: (orgHost: string) => `${orgHost}:accessToken`,
  isNewUser: (orgHost: string) => `${orgHost}:isNewUser`,
}

export class WalletService {
  private walletAddress: string | null = null

  constructor(
    private readonly walletClient: WalletClient,
    private readonly rpcClient: RpcClient,
    private readonly orgHost: string,
    private readonly networkService: NetworkService
  ) {}

  /**
   * Password/PIN mismatch detection for decrypt errors.
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

  private normalizeAddr(v: unknown): string {
    const s = String(v ?? '').trim()
    return s ? s.toLowerCase() : ''
  }

  private addressesMismatch(a: string, b: string): boolean {
    return !!a && !!b && a.toLowerCase() !== b.toLowerCase()
  }

  /**
   * deviceId: stable identifier for the current device/browser profile.
   * Used to store/fetch server-side device recovery backup.
   */
  private async getOrCreateDeviceId(firebaseId: string): Promise<string> {
    const scopedKey = STORAGE_KEYS.deviceId(this.orgHost, firebaseId)
    const existing = await LocalForage.get<string>(scopedKey)
    if (existing) return existing

    // Migration: legacy
    const legacy = await LocalForage.get<string>(
      STORAGE_KEYS.deviceIdLegacy(this.orgHost)
    )
    if (legacy) {
      await LocalForage.save(scopedKey, legacy)
      return legacy
    }

    const id = nodeCrypto.randomBytes(16).toString('hex')
    await LocalForage.save(scopedKey, id)
    return id
  }

  /**
   * deviceSecret: device recovery secret. In the original SDK this was local-only.
   * To enable PIN reset after local storage wipe, we back it up to the server
   * (server should encrypt-at-rest; transport is TLS).
   */
  private async getOrCreateDeviceSecret(firebaseId: string): Promise<string> {
    const scopedKey = STORAGE_KEYS.deviceSecret(this.orgHost, firebaseId)
    const existing = await LocalForage.get<string>(scopedKey)
    if (existing) return existing

    // Migration: legacy
    const legacy = await LocalForage.get<string>(
      STORAGE_KEYS.deviceSecretLegacy(this.orgHost)
    )
    if (legacy) {
      await LocalForage.save(scopedKey, legacy)
      return legacy
    }

    const secret = nodeCrypto.randomBytes(32).toString('hex')
    await LocalForage.save(scopedKey, secret)
    return secret
  }

  /**
   * Always overwrite encryptedShare2_device when we have a fresh share2.
   * Also upsert to server so that PIN reset can work after local storage wipe.
   *
   * Note: Server backup is best-effort; we do not fail the main flow if backup fails.
   */
  private async ensureDeviceEncryptedShare2(
    share2Plain: string,
    firebaseId: string
  ): Promise<void> {
    const deviceId = await this.getOrCreateDeviceId(firebaseId)
    const deviceSecret = await this.getOrCreateDeviceSecret(firebaseId)

    const encryptedKey = STORAGE_KEYS.encryptedShare2Device(
      this.orgHost,
      firebaseId
    )
    const encrypted = Crypto.encryptShare(share2Plain, deviceSecret, firebaseId)

    // Always overwrite locally to avoid stale device share2.
    await LocalForage.save(encryptedKey, encrypted)

    // Best-effort server backup
    try {
      await this.walletClient.upsertDeviceRecovery({
        deviceId,
        encryptedShare2Device: encrypted,
        deviceSecret,
      } as any)
    } catch (e) {
      // Do not block core flows; log only.
      console.warn('[WalletService] device recovery backup upsert failed', e)
    }
  }

  async getAddress(): Promise<string> {
    try {
      if (this.walletAddress) return this.walletAddress

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

  async create(password: string): Promise<string> {
    try {
      const firebaseId = await LocalForage.get<string>(
        STORAGE_KEYS.firebaseId(this.orgHost)
      )

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

      const mnemonic = generateMnemonic()
      const seed = await mnemonicToSeed(mnemonic)
      const wallet = new Wallet(seed.slice(0, 32).toString('hex'))

      const shares = await Secrets.split(wallet.privateKey, 3, 2)
      const [share1, share2, share3] = shares

      const encryptedShare2 = Crypto.encryptShare(share2, password, firebaseId)
      const encryptedShare3 = Crypto.encryptShare(share3, password, firebaseId)

      await LocalForage.save(
        STORAGE_KEYS.encryptedShare2(this.orgHost),
        encryptedShare2
      )

      // device recovery material (local + server backup best-effort)
      await this.ensureDeviceEncryptedShare2(share2, firebaseId)

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
      const serverAddr = this.normalizeAddr((walletInfo as any)?.address)

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
          // fallback: recover using encryptedShare3 from server
          const share3 = decryptShareOrThrow(
            (walletInfo as any).encryptedShare3
          )
          const privateKey = await Secrets.combine([
            (walletInfo as any).share1,
            share3,
          ])
          const wallet = new Wallet(privateKey)

          // Critical guard: recovered wallet must match server address
          const derivedAddr = this.normalizeAddr(wallet.address)
          if (this.addressesMismatch(serverAddr, derivedAddr)) {
            throw new SDKError(
              `Recovered wallet address mismatch. server=${serverAddr} derived=${derivedAddr}`,
              SDKErrorCode.WALLET_RECOVERY_FAILED
            )
          }

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

          // device recovery material must match the rotated share2 (local + server backup)
          await this.ensureDeviceEncryptedShare2(newShare2, firebaseId)

          this.walletAddress = wallet.address
          await LocalForage.save(
            STORAGE_KEYS.walletAddress(this.orgHost),
            wallet.address
          )

          // do not keep plaintext share2 after success
          await LocalForage.delete(STORAGE_KEYS.share2(this.orgHost))
          return wallet.address
        }
      }

      const privateKey = await Secrets.combine([
        (walletInfo as any).share1,
        share2,
      ])
      const wallet = new Wallet(privateKey)

      // Critical guard: recovered wallet must match server address
      const derivedAddr = this.normalizeAddr(wallet.address)
      if (this.addressesMismatch(serverAddr, derivedAddr)) {
        throw new SDKError(
          `Recovered wallet address mismatch. server=${serverAddr} derived=${derivedAddr}`,
          SDKErrorCode.WALLET_RECOVERY_FAILED
        )
      }

      // ensure device recovery material is fresh (local + server backup)
      await this.ensureDeviceEncryptedShare2(share2, firebaseId)

      this.walletAddress = wallet.address
      await LocalForage.save(
        STORAGE_KEYS.walletAddress(this.orgHost),
        wallet.address
      )

      // do not keep plaintext share2 after success
      await LocalForage.delete(STORAGE_KEYS.share2(this.orgHost))
      return wallet.address
    } catch (error) {
      this.walletAddress = null
      await LocalForage.delete(STORAGE_KEYS.share2(this.orgHost))
      if (error instanceof SDKError) throw error
      throw new SDKError(
        'Failed to retrieve wallet',
        SDKErrorCode.WALLET_RECOVERY_FAILED,
        error
      )
    }
  }

  /**
   * PIN reset (same private key/address) using device recovery material.
   * If local recovery material is missing, it attempts to restore it from server backup.
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

      // Try local first (user-scoped)
      let encryptedDevice = await LocalForage.get<string>(
        STORAGE_KEYS.encryptedShare2Device(this.orgHost, firebaseId)
      )
      let deviceSecret = await LocalForage.get<string>(
        STORAGE_KEYS.deviceSecret(this.orgHost, firebaseId)
      )

      // If missing locally, restore from server backup (latest)
      if (!encryptedDevice || !deviceSecret) {
        let backup: any
        try {
          backup = await this.walletClient.getDeviceRecovery(undefined as any)
        } catch (e) {
          throw new SDKError(
            'PIN reset is not available on this device',
            SDKErrorCode.RECOVERY_NOT_AVAILABLE,
            e
          )
        }

        if (
          !backup?.found ||
          !backup?.encryptedShare2Device ||
          !backup?.deviceSecret
        ) {
          throw new SDKError(
            'PIN reset is not available. No device recovery backup found for this user.',
            SDKErrorCode.RECOVERY_NOT_AVAILABLE
          )
        }

        encryptedDevice = backup.encryptedShare2Device
        deviceSecret = backup.deviceSecret

        // Persist restored materials locally (user-scoped)
        await LocalForage.save(
          STORAGE_KEYS.encryptedShare2Device(this.orgHost, firebaseId),
          encryptedDevice
        )
        await LocalForage.save(
          STORAGE_KEYS.deviceSecret(this.orgHost, firebaseId),
          deviceSecret
        )

        if (backup?.deviceId) {
          await LocalForage.save(
            STORAGE_KEYS.deviceId(this.orgHost, firebaseId),
            backup.deviceId
          )
        }
      }

      let share2: string
      try {
        share2 = Crypto.decryptShare(
          encryptedDevice!,
          deviceSecret!,
          firebaseId
        )
      } catch (e) {
        throw new SDKError(
          'PIN reset is not available. Recovery material cannot be decrypted.',
          SDKErrorCode.RECOVERY_NOT_AVAILABLE,
          e
        )
      }

      const walletInfo = await this.walletClient.getWallet()
      const serverAddr = this.normalizeAddr((walletInfo as any)?.address)

      const privateKey = await Secrets.combine([
        (walletInfo as any).share1,
        share2,
      ])
      const wallet = new Wallet(privateKey)

      // Critical guard: derived wallet must match server wallet address
      const derivedAddr = this.normalizeAddr(wallet.address)
      if (this.addressesMismatch(serverAddr, derivedAddr)) {
        throw new SDKError(
          `Device recovery does not match server wallet. server=${serverAddr} derived=${derivedAddr}`,
          SDKErrorCode.RECOVERY_NOT_AVAILABLE
        )
      }

      const newShares = await Secrets.split(wallet.privateKey, 3, 2)
      const [newShare1, newShare2, newShare3] = newShares

      await this.walletClient.updateWalletKey({
        share1: newShare1,
        encryptedShare3: Crypto.encryptShare(
          newShare3,
          newPassword,
          firebaseId
        ),
      })

      await LocalForage.save(
        STORAGE_KEYS.encryptedShare2(this.orgHost),
        Crypto.encryptShare(newShare2, newPassword, firebaseId)
      )

      // device recovery material should be overwritten too (fresh share2, local + server backup)
      await this.ensureDeviceEncryptedShare2(newShare2, firebaseId)

      this.walletAddress = wallet.address
      await LocalForage.save(
        STORAGE_KEYS.walletAddress(this.orgHost),
        wallet.address
      )

      await LocalForage.delete(STORAGE_KEYS.share2(this.orgHost))
      return wallet.address
    } catch (error) {
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

    const firebaseId = await LocalForage.get<string>(
      STORAGE_KEYS.firebaseId(this.orgHost)
    )

    if (firebaseId) {
      await LocalForage.delete(
        STORAGE_KEYS.encryptedShare2Device(this.orgHost, firebaseId)
      )
      await LocalForage.delete(
        STORAGE_KEYS.deviceSecret(this.orgHost, firebaseId)
      )
      await LocalForage.delete(STORAGE_KEYS.deviceId(this.orgHost, firebaseId))
    }

    // cleanup legacy keys as well
    await LocalForage.delete(
      STORAGE_KEYS.encryptedShare2DeviceLegacy(this.orgHost)
    )
    await LocalForage.delete(STORAGE_KEYS.deviceSecretLegacy(this.orgHost))
    await LocalForage.delete(STORAGE_KEYS.deviceIdLegacy(this.orgHost))
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
      params: [{ to: tokenAddress, data }, 'latest'],
    })

    const decimalsData = erc20.encodeFunctionData('decimals', [])
    const decimalsRes = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_CALL,
      params: [{ to: tokenAddress, data: decimalsData }, 'latest'],
    })
    const decimals = parseInt(decimalsRes.result, 16)

    const symbolData = erc20.encodeFunctionData('symbol', [])
    const symbolRes = await this.rpcClient.sendRpc({
      chainId,
      method: RpcMethod.ETH_CALL,
      params: [{ to: tokenAddress, data: symbolData }, 'latest'],
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
    const txHash = (response as any)?.result
    if (!txHash || typeof txHash !== 'string') {
      throw new SDKError(
        'RPC returned empty tx hash',
        SDKErrorCode.TRANSACTION_FAILED,
        response
      )
    }
    return txHash
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

      if (!nonce.result || nonce.result === '0x0') return undefined

      return {
        hash: '',
        status: TransactionStatus.SUCCESS,
        timestamp: Date.now(),
        value: '0',
      } as Transaction
    } catch {
      return undefined
    }
  }

  /**
   * Critical safety:
   * - Never overwrite cached walletAddress with derived signer address.
   * - If server/cached address != derived address => throw WALLET_RECOVERY_FAILED.
   */
  async sendTransaction(params: SendTransactionParams): Promise<string> {
    // JSON-RPC quantity helper
    const toHexQuantity = (v: string | undefined | null): string => {
      if (v === undefined || v === null) return '0x0'
      const s = String(v).trim()
      if (!s) return '0x0'
      if (s.startsWith('0x') || s.startsWith('0X')) return s
      try {
        const bi = BigInt(s)
        return '0x' + bi.toString(16)
      } catch {
        return s
      }
    }

    try {
      const walletInfo = await this.walletClient.getWallet()
      const share1 = (walletInfo as any)?.share1

      // Try session plaintext share2 first
      let share2 = await LocalForage.get<string>(
        STORAGE_KEYS.share2(this.orgHost)
      )

      // If missing, recover share2 from encryptedShare2_device (device recovery material)
      if (!share2) {
        try {
          const firebaseId = await LocalForage.get<string>(
            STORAGE_KEYS.firebaseId(this.orgHost)
          )

          if (firebaseId) {
            const encryptedDevice = await LocalForage.get<string>(
              STORAGE_KEYS.encryptedShare2Device(this.orgHost, firebaseId)
            )
            const deviceSecret = await LocalForage.get<string>(
              STORAGE_KEYS.deviceSecret(this.orgHost, firebaseId)
            )

            if (encryptedDevice && deviceSecret) {
              share2 = Crypto.decryptShare(
                encryptedDevice,
                deviceSecret,
                firebaseId
              )
              await LocalForage.save(STORAGE_KEYS.share2(this.orgHost), share2)
            }
          }
        } catch {
          // ignore and fallthrough
        }
      }

      if (!share1 || !share2) {
        throw new SDKError(
          'Wallet shares not found',
          SDKErrorCode.WALLET_NOT_FOUND
        )
      }

      const privateKey = await Secrets.combine([share1, share2])
      const wallet = new Wallet(privateKey)
      const from = wallet.address

      const serverAddress = String((walletInfo as any)?.address ?? '').trim()
      const cachedAddress = String(
        (await LocalForage.get<string>(
          STORAGE_KEYS.walletAddress(this.orgHost)
        )) ?? ''
      ).trim()

      const mismatch = (a: string, b: string) =>
        a && b && a.toLowerCase() !== b.toLowerCase()

      if (mismatch(serverAddress, from) || mismatch(cachedAddress, from)) {
        throw new SDKError(
          `Wallet share mismatch detected. server=${serverAddress || 'N/A'} cached=${cachedAddress || 'N/A'} derived=${from}. ` +
            `Please re-enter PIN (retrieveWallet/resetPin) to refresh shares.`,
          SDKErrorCode.WALLET_RECOVERY_FAILED
        )
      }

      // Preflight: sender native balance must be > 0 to pay for gas.
      const nativeBal = await this.rpcClient.sendRpc({
        chainId: params.chainId,
        method: RpcMethod.ETH_GET_BALANCE,
        params: [from, 'latest'],
      })

      if (!nativeBal?.result || BigInt(nativeBal.result) === 0n) {
        throw new SDKError(
          `Insufficient native balance for gas. sender=${from} balance=${nativeBal?.result ?? '0x0'}`,
          SDKErrorCode.TRANSACTION_FAILED
        )
      }

      // Use pending nonce to avoid nonce-too-low when tx pending.
      const pendingNonceHex = await this.rpcClient.sendRpc({
        chainId: params.chainId,
        method: RpcMethod.ETH_GET_TRANSACTION_COUNT,
        params: [from, 'pending'],
      })

      const pendingNonce = parseInt(
        (pendingNonceHex as any)?.result ?? '0x0',
        16
      )
      const nonce = params.nonce ?? pendingNonce

      // Legacy gasPrice with slight bump
      let gasPrice = params.gasPrice ?? (await this.getGasPrice(params.chainId))
      try {
        const bumped = (BigInt(gasPrice) * 12n) / 10n // +20%
        gasPrice = '0x' + bumped.toString(16)
      } catch {
        // ignore
      }

      // Gas limit estimation + buffer / fallback
      let gasLimit = params.gasLimit
      if (!gasLimit) {
        try {
          const est = await this.estimateGas(
            {
              from,
              to: params.to,
              value: toHexQuantity(params.value),
              data: params.data || '0x',
            },
            params.chainId
          )
          const buffered = Math.max(21000, Math.ceil(est * 1.2))
          gasLimit = '0x' + buffered.toString(16)
        } catch {
          const data = (params.data || '0x').toLowerCase()
          const isApprove = data.startsWith('0x095ea7b3')
          const fallback = isApprove
            ? 120_000
            : data !== '0x'
              ? 800_000
              : 21_000
          gasLimit = '0x' + fallback.toString(16)
        }
      }

      const signedTx = await wallet.signTransaction({
        to: params.to,
        value: params.value ?? '0',
        data: params.data || '0x',
        chainId: params.chainId,
        nonce,
        gasPrice,
        gasLimit,
      })

      // Debug: derived sender from signed tx (sanity check)
      try {
        const parsed = EthersTx.from(signedTx)
        const derivedFrom = (parsed as any)?.from
        if (
          derivedFrom &&
          String(derivedFrom).toLowerCase() !== from.toLowerCase()
        ) {
          console.warn('[WalletService] signedTx sender mismatch.', {
            walletFrom: from,
            txFrom: derivedFrom,
          })
        }
      } catch {
        // ignore
      }

      const txHash = await this.sendRawTransaction(signedTx, params.chainId)

      // Remove session plaintext share2 after tx
      await LocalForage.delete(STORAGE_KEYS.share2(this.orgHost))

      return txHash
    } catch (error) {
      // Always clear plaintext share2 on failure too (avoid stale reuse)
      await LocalForage.delete(STORAGE_KEYS.share2(this.orgHost))

      if (error instanceof SDKError) throw error

      const msg = (() => {
        try {
          const anyErr = error as any
          return (
            anyErr?.shortMessage ||
            anyErr?.reason ||
            anyErr?.message ||
            String(error)
          )
        } catch {
          return 'Unknown error'
        }
      })()

      throw new SDKError(
        `Transaction failed: ${msg}`,
        SDKErrorCode.TRANSACTION_FAILED,
        error
      )
    }
  }
}
