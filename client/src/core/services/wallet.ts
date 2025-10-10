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

// ERC-20 ABI 중 balanceOf, decimals, symbol 만 정의
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

export class WalletService {
  private walletAddress: string | null = null

  constructor(
    private readonly walletClient: WalletClient,
    private readonly rpcClient: RpcClient,
    private readonly orgHost: string,
    private readonly networkService: NetworkService
  ) {}

  async getAddress(): Promise<string> {
    try {
      // 메모리에 있으면 반환
      if (this.walletAddress) {
        return this.walletAddress
      }

      // LocalForage에서 조회
      const savedAddress = await LocalForage.get<string>(
        `${this.orgHost}:walletAddress`
      )
      if (savedAddress) {
        this.walletAddress = savedAddress
        return savedAddress
      }

      // 서버에서 조회
      const walletInfo = await this.walletClient.getWallet()
      if (walletInfo?.address) {
        this.walletAddress = walletInfo.address
        await LocalForage.save(
          `${this.orgHost}:walletAddress`,
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
      await LocalForage.save(`${this.orgHost}:walletAddress`, wallet.address)

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
        `${this.orgHost}:accessToken`
      )
      if (!accessToken) {
        throw new SDKError('Access token not found', SDKErrorCode.AUTH_REQUIRED)
      }

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

      let share2 = await LocalForage.get<string>(`${this.orgHost}:share2`)

      if (!share2) {
        const encryptedShare2 = await LocalForage.get<string>(
          `${this.orgHost}:encryptedShare2`
        )
        if (encryptedShare2) {
          share2 = Crypto.decryptShare(encryptedShare2, password, firebaseId)
          await LocalForage.save(`${this.orgHost}:share2`, share2)
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
          this.walletAddress = wallet.address
          console.log('15. Wallet address set:', this.walletAddress)
          return wallet.address
        }
      }

      console.log('15. Combining share1 and share2...')
      const privateKey = await Secrets.combine([walletInfo.share1, share2])
      const wallet = new Wallet(privateKey)
      this.walletAddress = wallet.address
      await LocalForage.save(`${this.orgHost}:walletAddress`, wallet.address)
      await LocalForage.delete(`${this.orgHost}:share2`)
      return wallet.address
    } catch (error) {
      this.walletAddress = null
      await LocalForage.delete(`${this.orgHost}:share2`)
      console.error('Error in retrieveWallet:', error)
      if (error instanceof SDKError) throw error
      throw new SDKError(
        'Failed to retrieve wallet',
        SDKErrorCode.WALLET_RECOVERY_FAILED,
        error
      )
    }
  }

  async clearWalletState(): Promise<void> {
    this.walletAddress = null
    await LocalForage.delete(`${this.orgHost}:walletAddress`)
    await LocalForage.delete(`${this.orgHost}:share2`)
    await LocalForage.delete(`${this.orgHost}:encryptedShare2`)
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

    // balanceOf 호출 data 생성
    const data = erc20.encodeFunctionData('balanceOf', [walletAddress])

    // RPC call
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

    // decimals 호출
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

    // symbol 호출
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
      // 단순히 nonce 값으로 최근 트랜잭션 여부만 확인
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

      // 1. Share 복구 및 private key 생성
      const [share1, share2] = await Promise.all([
        this.walletClient.getWallet().then((wallet) => wallet.share1),
        LocalForage.get<string>(`${this.orgHost}:share2`),
      ])

      if (!share1 || !share2) {
        throw new SDKError(
          'Wallet shares not found',
          SDKErrorCode.WALLET_NOT_FOUND
        )
      }

      const privateKey = await Secrets.combine([share1, share2])
      const wallet = new Wallet(privateKey)

      // 2. 트랜잭션 파라미터 준비
      const nonce =
        params.nonce ?? (await this.getTransactionCount(from, params.chainId))
      const gasPrice =
        params.gasPrice ?? (await this.getGasPrice(params.chainId))

      // 3. 트랜잭션 서명
      const signedTx = await wallet.signTransaction({
        to: params.to,
        value: params.value,
        data: params.data || '0x',
        chainId: params.chainId,
        nonce,
        gasPrice,
        gasLimit: params.gasLimit,
      })

      // 4. 서명된 트랜잭션 전송
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
