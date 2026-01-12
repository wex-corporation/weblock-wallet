import { RpcClient } from '../../clients/api/rpcs'
import { WalletService } from './wallet'
import { NetworkService } from './network'
import { Interface } from 'ethers'
import { RpcMethod } from '@/clients/types'
import { EventEmitter } from 'events'
import { setTimeout } from 'timers'

import {
  SDKError,
  SDKErrorCode,
  TransactionReceipt,
  TransactionStatus,
} from '../../types'

import {
  GetOfferingParams,
  OfferingView,
  InvestRbtParams,
  InvestRbtResult,
  ClaimRbtRevenueParams,
  ClaimRbtRevenueResult,
} from '../../types/investment'

import { ERC20_ABI } from '../../contract/contracts'
import {
  RBT_PRIMARY_SALE_ROUTER_ABI,
  RBT_PROPERTY_TOKEN_ABI,
} from '../../contract/weblock'

const MAX_UINT256 = 2n ** 256n - 1n

export class InvestmentService extends EventEmitter {
  private readonly erc20Interface: Interface
  private readonly saleInterface: Interface
  private readonly rbtInterface: Interface
  private readonly chainIdCache = new Map<string, number>()

  constructor(
    private readonly rpcClient: RpcClient,
    private readonly walletService: WalletService,
    private readonly networkService: NetworkService
  ) {
    super()
    this.erc20Interface = new Interface(ERC20_ABI)
    this.saleInterface = new Interface(RBT_PRIMARY_SALE_ROUTER_ABI as any)
    this.rbtInterface = new Interface(RBT_PROPERTY_TOKEN_ABI as any)
  }

  private assertHexAddress(addr: string, field: string) {
    const a = (addr ?? '').trim()
    if (!a.startsWith('0x') || a.length !== 42) {
      throw new SDKError(`Invalid ${field}`, SDKErrorCode.INVALID_PARAMS)
    }
  }

  private toBigInt(v: bigint | number | string, field: string): bigint {
    try {
      if (typeof v === 'bigint') return v
      if (typeof v === 'number') {
        if (!Number.isFinite(v) || v < 0) throw new Error('invalid number')
        return BigInt(v)
      }
      const s = (v ?? '').toString().trim()
      if (!s) throw new Error('empty')
      // 0x or decimal
      return BigInt(s)
    } catch {
      throw new SDKError(`Invalid ${field}`, SDKErrorCode.INVALID_PARAMS)
    }
  }

  /**
   * Resolve `networkId` (wallet backend blockchainId UUID) or chainId string -> EVM chainId
   */
  private async resolveChainId(networkId: string): Promise<number> {
    const trimmed = (networkId ?? '').trim()
    const cached = this.chainIdCache.get(trimmed)
    if (cached) return cached

    const numeric = Number(trimmed)
    if (!Number.isNaN(numeric) && Number.isFinite(numeric) && numeric > 0) {
      this.chainIdCache.set(trimmed, numeric)
      return numeric
    }

    // fast path: current network
    try {
      const current = await this.networkService.getCurrentNetwork()
      if (current && current.id === trimmed) {
        this.chainIdCache.set(trimmed, current.chainId)
        return current.chainId
      }
      if (current && String(current.chainId) === trimmed) {
        this.chainIdCache.set(trimmed, current.chainId)
        return current.chainId
      }
    } catch {
      // ignore
    }

    // fallback: all networks
    const networks = await this.networkService.getRegisteredNetworks()
    const found = networks.find((n) => n.id === trimmed)
    if (found) {
      this.chainIdCache.set(trimmed, found.chainId)
      return found.chainId
    }
    const foundByChainId = networks.find((n) => String(n.chainId) === trimmed)
    if (foundByChainId) {
      this.chainIdCache.set(trimmed, foundByChainId.chainId)
      return foundByChainId.chainId
    }

    throw new SDKError('Invalid network', SDKErrorCode.INVALID_NETWORK)
  }

  private async ethCall(
    chainId: number,
    to: string,
    data: string
  ): Promise<string> {
    const res = await this.rpcClient.sendRpc<string>({
      chainId,
      method: RpcMethod.ETH_CALL,
      params: [{ to, data }, 'latest'],
    })

    // ✅ error가 내려오는 케이스도 방어
    if (res.error) {
      throw new SDKError(
        `ETH_CALL failed: ${res.error.message}`,
        SDKErrorCode.REQUEST_FAILED,
        res.error
      )
    }

    // ✅ result?: string 이므로 undefined 방어 후 string으로 좁힘
    if (res.result === undefined) {
      throw new SDKError(
        'ETH_CALL returned empty result',
        SDKErrorCode.REQUEST_FAILED
      )
    }

    return res.result
  }

  private decodeU256(
    resultHex: string,
    method: 'allowance' | 'balanceOf' | 'claimable'
  ): bigint {
    const decoded = this.erc20Interface.decodeFunctionResult(
      method as any,
      resultHex as any
    )
    // ethers v6: bigint
    return BigInt(decoded[0].toString())
  }

  async getOffering(params: GetOfferingParams): Promise<OfferingView> {
    this.assertHexAddress(params.saleRouterAddress, 'saleRouterAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const offeringId = this.toBigInt(params.offeringId, 'offeringId')

    const data = this.saleInterface.encodeFunctionData('offerings', [
      offeringId,
    ])
    const result = await this.ethCall(chainId, params.saleRouterAddress, data)

    const decoded = this.saleInterface.decodeFunctionResult('offerings', result)
    const asset = decoded[0] as string
    const seriesId = BigInt(decoded[1].toString())
    const unitPrice = BigInt(decoded[2].toString())
    const remainingUnits = BigInt(decoded[3].toString())
    const startAt = BigInt(decoded[4].toString())
    const endAt = BigInt(decoded[5].toString())
    const treasury = decoded[6] as string
    const enabled = Boolean(decoded[7])

    return {
      asset,
      seriesId,
      unitPrice,
      remainingUnits,
      startAt,
      endAt,
      treasury,
      enabled,
    }
  }

  /**
   * USDR로 투자 (approve 필요. autoApprove 옵션 제공)
   * - Router.buy(offeringId, units, maxCost) 호출
   */
  async investRbtWithUsdr(params: InvestRbtParams): Promise<InvestRbtResult> {
    this.assertHexAddress(params.usdrAddress, 'usdrAddress')
    this.assertHexAddress(params.saleRouterAddress, 'saleRouterAddress')

    const chainId = await this.resolveChainId(params.networkId)
    const offeringId = this.toBigInt(params.offeringId, 'offeringId')
    const units = this.toBigInt(params.units, 'units')
    if (units <= 0n) {
      throw new SDKError('Invalid units', SDKErrorCode.INVALID_PARAMS)
    }

    const offering = await this.getOffering({
      networkId: params.networkId,
      saleRouterAddress: params.saleRouterAddress,
      offeringId,
    })

    if (!offering.enabled) {
      throw new SDKError('Offering is disabled', SDKErrorCode.REQUEST_FAILED)
    }

    // cost = units * unitPrice
    const cost = units * offering.unitPrice
    const maxCost =
      params.maxCostWei != null
        ? this.toBigInt(params.maxCostWei, 'maxCostWei')
        : cost

    if (maxCost < cost) {
      throw new SDKError(
        'maxCostWei is less than required cost',
        SDKErrorCode.INVALID_PARAMS
      )
    }

    const buyer = await this.walletService.getAddress()

    let approvalTxHash: string | undefined

    // autoApprove: allowance 확인 후 필요 시 approve
    const autoApprove = params.autoApprove ?? true
    const approveMax = params.approveMax ?? true
    const waitForApprovalReceipt = params.waitForApprovalReceipt ?? true

    if (autoApprove) {
      const allowanceData = this.erc20Interface.encodeFunctionData(
        'allowance',
        [buyer, params.saleRouterAddress]
      )
      const allowanceHex = await this.ethCall(
        chainId,
        params.usdrAddress,
        allowanceData
      )
      const allowanceDecoded = this.erc20Interface.decodeFunctionResult(
        'allowance',
        allowanceHex
      )
      const allowance = BigInt(allowanceDecoded[0].toString())

      if (allowance < cost) {
        const approveAmount = approveMax ? MAX_UINT256 : cost
        const approveData = this.erc20Interface.encodeFunctionData('approve', [
          params.saleRouterAddress,
          approveAmount.toString(),
        ])

        approvalTxHash = await this.walletService.sendTransaction({
          to: params.usdrAddress,
          value: '0',
          data: approveData,
          chainId,
          gasLimit: params.gasLimitApprove,
        })

        this.trackTransaction(approvalTxHash, chainId)

        if (waitForApprovalReceipt) {
          const ok = await this.waitForSuccessReceipt(approvalTxHash, chainId)
          if (!ok) {
            throw new SDKError(
              'Approve transaction failed',
              SDKErrorCode.TRANSACTION_FAILED
            )
          }
        }
      }
    }

    // buy
    const buyData = this.saleInterface.encodeFunctionData('buy', [
      offeringId,
      units,
      maxCost,
    ])

    const purchaseTxHash = await this.walletService.sendTransaction({
      to: params.saleRouterAddress,
      value: '0',
      data: buyData,
      chainId,
      gasLimit: params.gasLimitBuy,
    })

    this.trackTransaction(purchaseTxHash, chainId)

    return {
      offering,
      costWei: cost.toString(),
      approvalTxHash,
      purchaseTxHash,
    }
  }

  /**
   * RBT 수익(이자) claim
   * - RBTPropertyToken.claim(seriesId)
   */
  async claimRbtRevenue(
    params: ClaimRbtRevenueParams
  ): Promise<ClaimRbtRevenueResult> {
    this.assertHexAddress(params.rbtAssetAddress, 'rbtAssetAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const seriesId = this.toBigInt(params.seriesId, 'seriesId')

    const claimData = this.rbtInterface.encodeFunctionData('claim', [seriesId])

    const txHash = await this.walletService.sendTransaction({
      to: params.rbtAssetAddress,
      value: '0',
      data: claimData,
      chainId,
      gasLimit: params.gasLimit,
    })

    this.trackTransaction(txHash, chainId)
    return { txHash }
  }

  /**
   * claimable 조회 (eth_call)
   */
  async getClaimable(params: {
    networkId: string
    rbtAssetAddress: string
    seriesId: bigint | number | string
    account?: string
  }): Promise<string> {
    this.assertHexAddress(params.rbtAssetAddress, 'rbtAssetAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const seriesId = this.toBigInt(params.seriesId, 'seriesId')
    const account = params.account ?? (await this.walletService.getAddress())
    this.assertHexAddress(account, 'account')

    const data = this.rbtInterface.encodeFunctionData('claimable', [
      seriesId,
      account,
    ])
    const result = await this.ethCall(chainId, params.rbtAssetAddress, data)
    const decoded = this.rbtInterface.decodeFunctionResult('claimable', result)
    return BigInt(decoded[0].toString()).toString()
  }

  /**
   * RBT balanceOf 조회 (eth_call)
   */
  async getRbtBalance(params: {
    networkId: string
    rbtAssetAddress: string
    seriesId: bigint | number | string
    account?: string
  }): Promise<string> {
    this.assertHexAddress(params.rbtAssetAddress, 'rbtAssetAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const seriesId = this.toBigInt(params.seriesId, 'seriesId')
    const account = params.account ?? (await this.walletService.getAddress())
    this.assertHexAddress(account, 'account')

    const data = this.rbtInterface.encodeFunctionData('balanceOf', [
      account,
      seriesId,
    ])
    const result = await this.ethCall(chainId, params.rbtAssetAddress, data)
    const decoded = this.rbtInterface.decodeFunctionResult('balanceOf', result)
    return BigInt(decoded[0].toString()).toString()
  }

  private async waitForSuccessReceipt(
    txHash: string,
    chainId: number
  ): Promise<boolean> {
    let retryCount = 0
    const MAX_RETRIES = 20 // 60초(3초*20)

    while (retryCount < MAX_RETRIES) {
      const res = await this.rpcClient.sendRpc<TransactionReceipt>({
        chainId,
        method: RpcMethod.ETH_GET_TRANSACTION_RECEIPT,
        params: [txHash],
      })

      if (res.result) {
        return res.result.status === '0x1'
      }

      retryCount++
      await new Promise((r) => setTimeout(r, 3000))
    }

    return false
  }

  private trackTransaction(txHash: string, chainId: number): void {
    let retryCount = 0
    const MAX_RETRIES = 20

    const checkStatus = async () => {
      try {
        const response = await this.rpcClient.sendRpc<TransactionReceipt>({
          chainId,
          method: RpcMethod.ETH_GET_TRANSACTION_RECEIPT,
          params: [txHash],
        })

        if (response.result) {
          const status =
            response.result.status === '0x1'
              ? TransactionStatus.SUCCESS
              : TransactionStatus.FAILED

          this.emit('transactionStatusChanged', {
            hash: txHash,
            status,
            timestamp: Date.now(),
          })
          return
        }

        retryCount++
        if (retryCount < MAX_RETRIES) {
          setTimeout(checkStatus, 3000)
        } else {
          this.emit('transactionStatusChanged', {
            hash: txHash,
            status: TransactionStatus.FAILED,
            timestamp: Date.now(),
            error: 'Transaction timeout',
          })
        }
      } catch (error) {
        this.emit('transactionStatusChanged', {
          hash: txHash,
          status: TransactionStatus.FAILED,
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    checkStatus()
  }
}
