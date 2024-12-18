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
} from '../../types'
import { ERC20_ABI } from '../../contract/contracts'
import { Interface } from 'ethers'
import { RpcMethod } from '@/clients/types'
import { LocalForage } from '../../utils/storage'

export class AssetService {
  private readonly erc20Interface: Interface

  constructor(
    private readonly rpcClient: RpcClient,
    private readonly orgHost: string
  ) {
    this.erc20Interface = new Interface(ERC20_ABI)
  }

  private async getCurrentWalletAddress(): Promise<string> {
    const walletAddress = await LocalForage.get<string>(
      `${this.orgHost}:walletAddress`
    )
    if (!walletAddress) {
      throw new SDKError('Wallet not found', SDKErrorCode.WALLET_NOT_FOUND)
    }
    return walletAddress
  }

  async transfer(params: TransferRequest): Promise<TransferResponse> {
    try {
      const data = this.erc20Interface.encodeFunctionData('transfer', [
        params.to,
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

      return {
        transaction: {
          hash: response.result,
          type: 'send',
          status: 'pending',
          timestamp: Date.now(),
          value: params.amount,
          symbol: params.type === 'NATIVE' ? (params.symbol ?? '') : '',
        },
      }
    } catch (error) {
      throw new SDKError(
        'Failed to transfer token',
        SDKErrorCode.TRANSFER_FAILED,
        error
      )
    }
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

  async getTokenInfo(params: TokenInfoParams): Promise<TokenInfo> {
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.callTokenMethod(params.tokenAddress, params.networkId, 'name'),
        this.callTokenMethod(params.tokenAddress, params.networkId, 'symbol'),
        this.callTokenMethod(params.tokenAddress, params.networkId, 'decimals'),
        this.callTokenMethod(
          params.tokenAddress,
          params.networkId,
          'totalSupply'
        ),
      ])

      return {
        address: params.tokenAddress,
        name: this.decodeResult(name, 'name'),
        symbol: this.decodeResult(symbol, 'symbol'),
        decimals: Number(this.decodeResult(decimals, 'decimals')),
        totalSupply: this.decodeResult(totalSupply, 'totalSupply'),
        type: 'ERC20' as const,
        balance: null,
      }
    } catch (error) {
      throw new SDKError(
        'Failed to get token info',
        SDKErrorCode.REQUEST_FAILED,
        error
      )
    }
  }

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

  async checkSecurityTokenCompliance(params: {
    networkId: string
    tokenAddress: string
    from: string
    to: string
    amount: string
  }): Promise<{
    canTransfer: boolean
    reasons?: string[]
  }> {
    // TODO: Implement security token compliance check
    return { canTransfer: true }
  }
}
