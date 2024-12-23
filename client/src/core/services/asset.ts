import { RpcClient } from '../../clients/api/rpcs'
import {
  TransferRequest,
  TokenBalanceParams,
  TokenApprovalParams,
  TokenAllowanceParams,
  TokenInfoParams,
  TokenInfo,
  SDKError,
  SDKErrorCode,
  TransferResponse,
  TransactionStatus,
  TransactionType,
  TransactionReceipt,
  TokenBalance,
} from '../../types'
import { ERC20_ABI } from '../../contract/contracts'
import { Interface } from 'ethers'
import { RpcMethod } from '@/clients/types'
import { LocalForage } from '../../utils/storage'
import { WalletService } from './wallet'
import { NetworkService } from './network'
import { EventEmitter } from 'events'
import { setTimeout } from 'timers'

export class AssetService extends EventEmitter {
  private readonly erc20Interface: Interface

  constructor(
    private readonly rpcClient: RpcClient,
    private readonly walletService: WalletService,
    private readonly networkService: NetworkService,
    private readonly orgHost: string
  ) {
    super()
    this.erc20Interface = new Interface(ERC20_ABI)
  }

  async transfer(params: TransferRequest): Promise<TransferResponse> {
    const { networkId, to, amount, type, tokenAddress, gasLimit, gasPrice } =
      params

    try {
      // 1. 네트워크 확인
      const network = await this.networkService.getCurrentNetwork()
      if (!network || network.id !== networkId) {
        throw new SDKError('Invalid network', SDKErrorCode.INVALID_NETWORK)
      }

      // 2. 지갑 주소 확인
      const from = await this.walletService.getAddress()
      if (!from) {
        throw new SDKError('Wallet not found', SDKErrorCode.WALLET_NOT_FOUND)
      }

      let txHash: string

      // 3. 토큰 타입별 전송 처리
      if (type === 'NATIVE') {
        // 네이티브 토큰 전송
        txHash = await this.walletService.sendTransaction({
          to,
          value: amount,
          chainId: network.chainId,
          gasLimit: gasLimit,
          gasPrice: gasPrice,
        })
      } else if (type === 'ERC20') {
        if (!tokenAddress) {
          throw new SDKError(
            'Token address required',
            SDKErrorCode.INVALID_PARAMS
          )
        }

        // ERC20 토큰 전송
        const data = this.erc20Interface.encodeFunctionData('transfer', [
          to,
          amount,
        ])
        txHash = await this.walletService.sendTransaction({
          to: tokenAddress,
          value: '0',
          data,
          chainId: network.chainId,
        })
      } else {
        throw new SDKError(
          'Unsupported token type',
          SDKErrorCode.INVALID_PARAMS
        )
      }

      // 4. 트랜잭션 상태 추적 시작
      this.trackTransaction(txHash, network.chainId)

      // 5. 응답 반환
      return {
        transaction: {
          hash: txHash,
          status: TransactionStatus.PENDING,
          type: TransactionType.SEND,
          timestamp: Date.now(),
          value: amount,
          symbol: type === 'NATIVE' ? network.symbol : params.symbol || '',
        },
      }
    } catch (error) {
      throw new SDKError('Transfer failed', SDKErrorCode.TRANSFER_FAILED, error)
    }
  }

  private async trackTransaction(
    txHash: string,
    chainId: number
  ): Promise<void> {
    let retryCount = 0
    const MAX_RETRIES = 20 // 최대 1분(3초 * 20회) 동안 시도

    const checkStatus = async () => {
      try {
        // 1. 트랜잭션 영수증 조회
        const response = await this.rpcClient.sendRpc<TransactionReceipt>({
          chainId,
          method: RpcMethod.ETH_GET_TRANSACTION_RECEIPT,
          params: [txHash],
        })

        // 2. 영수증이 있으면 상태 확인
        if (response.result) {
          const status =
            response.result.status === '0x1'
              ? TransactionStatus.SUCCESS
              : TransactionStatus.FAILED

          // 3. 이벤트 발생 (SDK 사용자에게 상태 변경 알림)
          this.emit('transactionStatusChanged', {
            hash: txHash,
            status,
            timestamp: Date.now(),
          })

          return
        }

        // 4. 아직 처리되지 않은 경우
        retryCount++
        if (retryCount < MAX_RETRIES) {
          setTimeout(checkStatus, 3000) // 직접 setTimeout 사용
        } else {
          // 최대 시도 횟수 초과
          this.emit('transactionStatusChanged', {
            hash: txHash,
            status: TransactionStatus.FAILED,
            timestamp: Date.now(),
            error: 'Transaction timeout',
          })
        }
      } catch (error) {
        console.error('Transaction tracking failed:', error)
        // 에러 발생 시에도 이벤트 발생
        this.emit('transactionStatusChanged', {
          hash: txHash,
          status: TransactionStatus.FAILED,
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // 최초 상태 확인 시작
    checkStatus()
  }

  async addToken(params: {
    type: 'ERC20' | 'SECURITY'
    networkId: string
    address: string
    symbol?: string
    decimals?: number
    name?: string
  }): Promise<void> {
    // Store token info in local storage
    const key = `${this.orgHost}:token:${params.networkId}:${params.address}`
    await LocalForage.save(key, params)
  }

  async getTokenBalance(params: TokenBalanceParams): Promise<string> {
    try {
      const data = this.erc20Interface.encodeFunctionData('balanceOf', [
        params.walletAddress,
      ])
      const response = await this.rpcClient.sendRpc({
        chainId: Number(params.networkId),
        method: RpcMethod.ETH_CALL,
        params: [
          {
            to: params.tokenAddress,
            data,
          },
          'latest',
        ],
      })
      return response.result
    } catch (error) {
      throw new SDKError(
        'Failed to get token balance',
        SDKErrorCode.REQUEST_FAILED,
        error
      )
    }
  }

  async approveToken(params: TokenApprovalParams): Promise<string> {
    try {
      const data = this.erc20Interface.encodeFunctionData('approve', [
        params.spender,
        params.amount,
      ])
      const response = await this.rpcClient.sendRpc({
        chainId: Number(params.networkId),
        method: RpcMethod.ETH_SEND_RAW_TRANSACTION,
        params: [
          {
            to: params.tokenAddress,
            data,
          },
        ],
      })
      return response.result
    } catch (error) {
      throw new SDKError(
        'Failed to approve token',
        SDKErrorCode.REQUEST_FAILED,
        error
      )
    }
  }

  async getAllowance(params: TokenAllowanceParams): Promise<string> {
    try {
      const data = this.erc20Interface.encodeFunctionData('allowance', [
        params.owner,
        params.spender,
      ])
      const response = await this.rpcClient.sendRpc({
        chainId: Number(params.networkId),
        method: RpcMethod.ETH_CALL,
        params: [
          {
            to: params.tokenAddress,
            data,
          },
          'latest',
        ],
      })
      return response.result
    } catch (error) {
      throw new SDKError(
        'Failed to get allowance',
        SDKErrorCode.REQUEST_FAILED,
        error
      )
    }
  }

  // async getTokenInfo(params: TokenInfoParams): Promise<TokenInfo> {
  //   try {
  //     const [name, symbol, decimals, totalSupply] = await Promise.all([
  //       this.callTokenMethod(params.tokenAddress, params.networkId, 'name'),
  //       this.callTokenMethod(params.tokenAddress, params.networkId, 'symbol'),
  //       this.callTokenMethod(params.tokenAddress, params.networkId, 'decimals'),
  //       this.callTokenMethod(
  //         params.tokenAddress,
  //         params.networkId,
  //         'totalSupply'
  //       ),
  //     ])

  //     return {
  //       address: params.tokenAddress,
  //       name: this.decodeResult(name, 'name'),
  //       symbol: this.decodeResult(symbol, 'symbol'),
  //       decimals: Number(this.decodeResult(decimals, 'decimals')),
  //       totalSupply: this.decodeResult(totalSupply, 'totalSupply'),
  //       type: 'ERC20' as const,
  //       balance: null as TokenBalance,
  //     }
  //   } catch (error) {
  //     throw new SDKError(
  //       'Failed to get token info',
  //       SDKErrorCode.REQUEST_FAILED,
  //       error
  //     )
  //   }
  // }

  private async callTokenMethod(
    tokenAddress: string,
    networkId: string,
    method: string
  ): Promise<string> {
    const data = this.erc20Interface.encodeFunctionData(method, [])
    const response = await this.rpcClient.sendRpc({
      chainId: Number(networkId),
      method: RpcMethod.ETH_CALL,
      params: [
        {
          to: tokenAddress,
          data,
        },
        'latest',
      ],
    })
    return response.result
  }

  private decodeResult(result: string, method: string): string {
    try {
      const decoded = this.erc20Interface.decodeFunctionResult(method, result)
      return decoded[0].toString()
    } catch (error) {
      throw new SDKError(
        'Failed to decode result',
        SDKErrorCode.REQUEST_FAILED,
        error
      )
    }
  }

  async addNFTCollection(params: {
    networkId: string
    address: string
    name?: string
  }): Promise<void> {
    const key = `${this.orgHost}:nft:${params.networkId}:${params.address}`
    await LocalForage.save(key, params)
  }

  // async checkSecurityTokenCompliance(params: {
  //   networkId: string
  //   tokenAddress: string
  //   from: string
  //   to: string
  //   amount: string
  // }): Promise<{
  //   canTransfer: boolean
  //   reasons?: string[]
  // }> {
  //   // TODO: Implement security token compliance check
  //   return { canTransfer: true }
  // }
}
