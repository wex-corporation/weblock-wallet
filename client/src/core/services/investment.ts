// client/src/core/services/investment.ts

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
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

/**
 * InvestRouter(신규) / LegacyRouter(구버전) offerings() 디코딩을 모두 지원하기 위한 ABI
 * - 신규(InvestRouter): (asset, seriesId, paymentToken, unitPrice, remainingUnits, startAt, endAt, treasury, enabled)
 * - 구버전(Legacy):      (asset, seriesId, unitPrice, remainingUnits, startAt, endAt, treasury, enabled)
 */
const OFFERING_ABI_INVEST_ROUTER = [
  {
    inputs: [{ name: 'offeringId', type: 'uint256' }],
    name: 'offerings',
    outputs: [
      { name: 'asset', type: 'address' },
      { name: 'seriesId', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
      { name: 'unitPrice', type: 'uint256' },
      { name: 'remainingUnits', type: 'uint256' },
      { name: 'startAt', type: 'uint64' },
      { name: 'endAt', type: 'uint64' },
      { name: 'treasury', type: 'address' },
      { name: 'enabled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const OFFERING_ABI_LEGACY_ROUTER = [
  {
    inputs: [{ name: 'offeringId', type: 'uint256' }],
    name: 'offerings',
    outputs: [
      { name: 'asset', type: 'address' },
      { name: 'seriesId', type: 'uint256' },
      { name: 'unitPrice', type: 'uint256' },
      { name: 'remainingUnits', type: 'uint256' },
      { name: 'startAt', type: 'uint64' },
      { name: 'endAt', type: 'uint64' },
      { name: 'treasury', type: 'address' },
      { name: 'enabled', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export class InvestmentService extends EventEmitter {
  private readonly erc20Interface: Interface
  private readonly saleInterface: Interface
  private readonly rbtInterface: Interface
  private readonly offeringInvestIface: Interface
  private readonly offeringLegacyIface: Interface
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
    this.offeringInvestIface = new Interface(OFFERING_ABI_INVEST_ROUTER as any)
    this.offeringLegacyIface = new Interface(OFFERING_ABI_LEGACY_ROUTER as any)
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
      return BigInt(s)
    } catch {
      throw new SDKError(`Invalid ${field}`, SDKErrorCode.INVALID_PARAMS)
    }
  }

  private async resolveChainId(networkId: string): Promise<number> {
    const trimmed = (networkId ?? '').trim()
    const cached = this.chainIdCache.get(trimmed)
    if (cached) return cached

    const numeric = Number(trimmed)
    if (!Number.isNaN(numeric) && Number.isFinite(numeric) && numeric > 0) {
      this.chainIdCache.set(trimmed, numeric)
      return numeric
    }

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

    if (res.error) {
      throw new SDKError(
        `ETH_CALL failed: ${res.error.message}`,
        SDKErrorCode.REQUEST_FAILED,
        res.error
      )
    }

    if (res.result === undefined) {
      throw new SDKError(
        'ETH_CALL returned empty result',
        SDKErrorCode.REQUEST_FAILED
      )
    }

    return res.result
  }

  async getOffering(params: GetOfferingParams): Promise<OfferingView> {
    this.assertHexAddress(params.saleRouterAddress, 'saleRouterAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const offeringId = this.toBigInt(params.offeringId, 'offeringId')

    const data = this.saleInterface.encodeFunctionData('offerings', [
      offeringId,
    ])
    const result = await this.ethCall(chainId, params.saleRouterAddress, data)

    let decoded: any
    let isLegacy = false
    try {
      decoded = this.offeringInvestIface.decodeFunctionResult(
        'offerings',
        result
      )
    } catch {
      decoded = this.offeringLegacyIface.decodeFunctionResult(
        'offerings',
        result
      )
      isLegacy = true
    }

    const asset = decoded[0] as string
    const seriesId = BigInt(decoded[1].toString())

    let paymentToken: string | undefined
    let unitPrice: bigint
    let remainingUnits: bigint
    let startAt: bigint
    let endAt: bigint
    let treasury: string
    let enabled: boolean

    if (!isLegacy) {
      paymentToken = decoded[2] as string
      unitPrice = BigInt(decoded[3].toString())
      remainingUnits = BigInt(decoded[4].toString())
      startAt = BigInt(decoded[5].toString())
      endAt = BigInt(decoded[6].toString())
      treasury = decoded[7] as string
      enabled = Boolean(decoded[8])
    } else {
      unitPrice = BigInt(decoded[2].toString())
      remainingUnits = BigInt(decoded[3].toString())
      startAt = BigInt(decoded[4].toString())
      endAt = BigInt(decoded[5].toString())
      treasury = decoded[6] as string
      enabled = Boolean(decoded[7])
    }

    // OfferingView 타입이 paymentToken을 모를 수 있어도 런타임에서는 넣어줌
    return {
      asset,
      seriesId,
      ...(paymentToken ? ({ paymentToken } as any) : {}),
      unitPrice,
      remainingUnits,
      startAt,
      endAt,
      treasury,
      enabled,
    } as OfferingView
  }

  /**
   * approve + buy (USDR/USDT 공용)
   * - InvestRouter: offering.paymentToken을 사용
   * - Legacy Router: params.usdrAddress를 사용
   */
  async investRbtWithUsdr(params: InvestRbtParams): Promise<InvestRbtResult> {
    this.assertHexAddress(params.saleRouterAddress, 'saleRouterAddress')

    // ✅ Legacy router 대응용: 존재할 때만 검증
    if (params.usdrAddress) {
      this.assertHexAddress(params.usdrAddress, 'usdrAddress')
    }

    const chainId = await this.resolveChainId(params.networkId)
    const offeringId = this.toBigInt(params.offeringId, 'offeringId')
    const units = this.toBigInt(params.units, 'units')
    if (units <= 0n)
      throw new SDKError('Invalid units', SDKErrorCode.INVALID_PARAMS)

    const offering = await this.getOffering({
      networkId: params.networkId,
      saleRouterAddress: params.saleRouterAddress,
      offeringId,
    })

    if (!offering.enabled) {
      throw new SDKError('Offering is disabled', SDKErrorCode.REQUEST_FAILED)
    }

    const paymentTokenFromOffering = (offering as any).paymentToken as
      | string
      | undefined

    // ✅ 여기서 "string | undefined"를 확실히 string으로 좁힘
    const paymentTokenAddressCandidate =
      paymentTokenFromOffering && paymentTokenFromOffering !== ZERO_ADDRESS
        ? paymentTokenFromOffering
        : params.usdrAddress

    if (!paymentTokenAddressCandidate) {
      throw new SDKError(
        'Payment token address is missing. Use InvestRouter (offering.paymentToken) or provide usdrAddress for legacy router.',
        SDKErrorCode.INVALID_PARAMS
      )
    }

    // ✅ 이제부터는 string으로 확정된 값만 사용
    const paymentTokenAddress: string = paymentTokenAddressCandidate
    this.assertHexAddress(paymentTokenAddress, 'paymentTokenAddress')

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

    const autoApprove = params.autoApprove ?? true
    const approveMax = params.approveMax ?? true
    const waitForApprovalReceipt = params.waitForApprovalReceipt ?? true

    if (autoApprove) {
      const allowanceData = this.erc20Interface.encodeFunctionData(
        'allowance',
        [buyer, params.saleRouterAddress]
      )

      // ✅ (에러 285 라인 계열 해결) to 파라미터 string 확정
      const allowanceHex = await this.ethCall(
        chainId,
        paymentTokenAddress,
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

        // ✅ (에러 317 라인 계열 해결) to 파라미터 string 확정
        approvalTxHash = await this.walletService.sendTransaction({
          to: paymentTokenAddress,
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

    const buyData = this.saleInterface.encodeFunctionData('buy', [
      offeringId,
      units,
      maxCost,
    ])

    // ✅ (에러 349 라인 계열은 buy 쪽도 함께 안정화된 상태)
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

      if (res.result) return res.result.status === '0x1'

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
