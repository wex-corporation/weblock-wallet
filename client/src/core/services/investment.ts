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
  BuyRwaProductParams,
  BuyRwaProductResult,
  ClaimAllRwaInterestParams,
  GetOfferingParams,
  GetRwaBalanceParams,
  GetRwaOfferingParams,
  GetClaimableRwaInterestParams,
  OfferingView,
  PreviewRedeemRwaParams,
  PreviewRedeemRwaResult,
  RedeemRwaParams,
  RedeemRwaResult,
  RwaOfferingView,
  InvestRbtParams,
  InvestRbtResult,
  ClaimRbtRevenueParams,
  ClaimRbtRevenueResult,
  ClaimRwaInterestParams,
  ClaimRwaInterestResult,
} from '../../types/investment'

import { ERC20_ABI } from '../../contract/contracts'
import {
  RBT_PRIMARY_SALE_ROUTER_ABI,
  RBT_PROPERTY_TOKEN_ABI,
  WEBLOCK_RWA_ASSET_ABI,
  WEBLOCK_RWA_INTEREST_VAULT_ABI,
  WEBLOCK_RWA_REDEMPTION_VAULT_ABI,
  WEBLOCK_RWA_SALE_ESCROW_ABI,
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
  private readonly rwaAssetInterface: Interface
  private readonly rwaSaleEscrowInterface: Interface
  private readonly rwaInterestVaultInterface: Interface
  private readonly rwaRedemptionVaultInterface: Interface
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
    this.rwaAssetInterface = new Interface(WEBLOCK_RWA_ASSET_ABI as any)
    this.rwaSaleEscrowInterface = new Interface(
      WEBLOCK_RWA_SALE_ESCROW_ABI as any
    )
    this.rwaInterestVaultInterface = new Interface(
      WEBLOCK_RWA_INTEREST_VAULT_ABI as any
    )
    this.rwaRedemptionVaultInterface = new Interface(
      WEBLOCK_RWA_REDEMPTION_VAULT_ABI as any
    )
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

  async getRwaOffering(params: GetRwaOfferingParams): Promise<RwaOfferingView> {
    this.assertHexAddress(params.saleEscrowAddress, 'saleEscrowAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const productId = this.toBigInt(params.productId, 'productId')

    const assetData = this.rwaSaleEscrowInterface.encodeFunctionData('asset', [])
    const assetRaw = await this.ethCall(chainId, params.saleEscrowAddress, assetData)
    const assetDecoded = this.rwaSaleEscrowInterface.decodeFunctionResult('asset', assetRaw)
    const asset = assetDecoded[0] as string

    const offeringData = this.rwaSaleEscrowInterface.encodeFunctionData(
      'offerings',
      [productId]
    )
    const offeringRaw = await this.ethCall(
      chainId,
      params.saleEscrowAddress,
      offeringData
    )
    const offeringDecoded = this.rwaSaleEscrowInterface.decodeFunctionResult(
      'offerings',
      offeringRaw
    )

    const targetUnits = BigInt(offeringDecoded[1].toString())
    const unitsSold = BigInt(offeringDecoded[2].toString())
    const remainingUnits =
      targetUnits > unitsSold ? targetUnits - unitsSold : BigInt(0)
    const saleStart = BigInt(offeringDecoded[3].toString())
    const saleEnd = BigInt(offeringDecoded[4].toString())
    const treasury = offeringDecoded[5] as string
    const status = Number(offeringDecoded[6].toString())

    let paymentOption: RwaOfferingView['paymentOption']
    if (params.paymentTokenAddress) {
      this.assertHexAddress(params.paymentTokenAddress, 'paymentTokenAddress')
      const optionData = this.rwaSaleEscrowInterface.encodeFunctionData(
        'paymentOptions',
        [productId, params.paymentTokenAddress]
      )
      const optionRaw = await this.ethCall(
        chainId,
        params.saleEscrowAddress,
        optionData
      )
      const optionDecoded = this.rwaSaleEscrowInterface.decodeFunctionResult(
        'paymentOptions',
        optionRaw
      )
      paymentOption = {
        tokenAddress: params.paymentTokenAddress,
        enabled: Boolean(optionDecoded[0]),
        known: Boolean(optionDecoded[1]),
        unitPrice: BigInt(optionDecoded[2].toString()),
        escrowedAmount: BigInt(optionDecoded[3].toString()),
        releasedAmount: BigInt(optionDecoded[4].toString()),
      }
    }

    return {
      asset,
      productId,
      targetUnits,
      unitsSold,
      remainingUnits,
      saleStart,
      saleEnd,
      treasury,
      status,
      enabled: status === 1,
      paymentOption,
    }
  }

  async buyRwaProduct(params: BuyRwaProductParams): Promise<BuyRwaProductResult> {
    this.assertHexAddress(params.saleEscrowAddress, 'saleEscrowAddress')
    this.assertHexAddress(params.paymentTokenAddress, 'paymentTokenAddress')

    const chainId = await this.resolveChainId(params.networkId)
    const productId = this.toBigInt(params.productId, 'productId')
    const units = this.toBigInt(params.units, 'units')
    if (units <= 0n) {
      throw new SDKError('Invalid units', SDKErrorCode.INVALID_PARAMS)
    }

    const offering = await this.getRwaOffering({
      networkId: params.networkId,
      saleEscrowAddress: params.saleEscrowAddress,
      productId,
      paymentTokenAddress: params.paymentTokenAddress,
    })

    if (!offering.enabled) {
      throw new SDKError('Offering is disabled', SDKErrorCode.REQUEST_FAILED)
    }

    const paymentOption = offering.paymentOption
    if (!paymentOption?.enabled || paymentOption.unitPrice <= 0n) {
      throw new SDKError(
        'Payment option is disabled for this product',
        SDKErrorCode.REQUEST_FAILED
      )
    }

    const cost = units * paymentOption.unitPrice
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
        [buyer, params.saleEscrowAddress]
      )
      const allowanceHex = await this.ethCall(
        chainId,
        params.paymentTokenAddress,
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
          params.saleEscrowAddress,
          approveAmount.toString(),
        ])

        approvalTxHash = await this.walletService.sendTransaction({
          to: params.paymentTokenAddress,
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

    const buyData = this.rwaSaleEscrowInterface.encodeFunctionData('buy', [
      productId,
      params.paymentTokenAddress,
      units,
      maxCost,
    ])

    const purchaseTxHash = await this.walletService.sendTransaction({
      to: params.saleEscrowAddress,
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

  async claimRwaInterest(
    params: ClaimRwaInterestParams
  ): Promise<ClaimRwaInterestResult> {
    this.assertHexAddress(params.interestVaultAddress, 'interestVaultAddress')
    this.assertHexAddress(params.rewardTokenAddress, 'rewardTokenAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const productId = this.toBigInt(params.productId, 'productId')

    const claimData = this.rwaInterestVaultInterface.encodeFunctionData(
      'claim',
      [productId, params.rewardTokenAddress]
    )

    const txHash = await this.walletService.sendTransaction({
      to: params.interestVaultAddress,
      value: '0',
      data: claimData,
      chainId,
      gasLimit: params.gasLimit,
    })

    this.trackTransaction(txHash, chainId)
    return { txHash }
  }

  async claimAllRwaInterest(
    params: ClaimAllRwaInterestParams
  ): Promise<ClaimRwaInterestResult> {
    this.assertHexAddress(params.interestVaultAddress, 'interestVaultAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const productId = this.toBigInt(params.productId, 'productId')

    const claimData = this.rwaInterestVaultInterface.encodeFunctionData(
      'claimAll',
      [productId]
    )

    const txHash = await this.walletService.sendTransaction({
      to: params.interestVaultAddress,
      value: '0',
      data: claimData,
      chainId,
      gasLimit: params.gasLimit,
    })

    this.trackTransaction(txHash, chainId)
    return { txHash }
  }

  async getClaimableRwaInterest(
    params: GetClaimableRwaInterestParams
  ): Promise<string> {
    this.assertHexAddress(params.interestVaultAddress, 'interestVaultAddress')
    this.assertHexAddress(params.rewardTokenAddress, 'rewardTokenAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const productId = this.toBigInt(params.productId, 'productId')
    const account = params.account ?? (await this.walletService.getAddress())
    this.assertHexAddress(account, 'account')

    const data = this.rwaInterestVaultInterface.encodeFunctionData(
      'claimable',
      [productId, params.rewardTokenAddress, account]
    )
    const result = await this.ethCall(chainId, params.interestVaultAddress, data)
    const decoded = this.rwaInterestVaultInterface.decodeFunctionResult(
      'claimable',
      result
    )
    return BigInt(decoded[0].toString()).toString()
  }

  async getRwaBalance(params: GetRwaBalanceParams): Promise<string> {
    this.assertHexAddress(params.assetAddress, 'assetAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const productId = this.toBigInt(params.productId, 'productId')
    const account = params.account ?? (await this.walletService.getAddress())
    this.assertHexAddress(account, 'account')

    const data = this.rwaAssetInterface.encodeFunctionData('balanceOf', [
      account,
      productId,
    ])
    const result = await this.ethCall(chainId, params.assetAddress, data)
    const decoded = this.rwaAssetInterface.decodeFunctionResult('balanceOf', result)
    return BigInt(decoded[0].toString()).toString()
  }

  async redeemRwa(params: RedeemRwaParams): Promise<RedeemRwaResult> {
    this.assertHexAddress(params.redemptionVaultAddress, 'redemptionVaultAddress')
    this.assertHexAddress(params.payoutTokenAddress, 'payoutTokenAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const productId = this.toBigInt(params.productId, 'productId')
    const units = this.toBigInt(params.units, 'units')

    const redeemData = this.rwaRedemptionVaultInterface.encodeFunctionData(
      'redeem',
      [productId, params.payoutTokenAddress, units]
    )

    const txHash = await this.walletService.sendTransaction({
      to: params.redemptionVaultAddress,
      value: '0',
      data: redeemData,
      chainId,
      gasLimit: params.gasLimit,
    })

    this.trackTransaction(txHash, chainId)
    return { txHash }
  }

  async previewRedeemRwa(
    params: PreviewRedeemRwaParams
  ): Promise<PreviewRedeemRwaResult> {
    this.assertHexAddress(params.redemptionVaultAddress, 'redemptionVaultAddress')
    this.assertHexAddress(params.payoutTokenAddress, 'payoutTokenAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const productId = this.toBigInt(params.productId, 'productId')
    const account = params.account ?? (await this.walletService.getAddress())
    this.assertHexAddress(account, 'account')

    const data = this.rwaRedemptionVaultInterface.encodeFunctionData(
      'previewRedeem',
      [productId, params.payoutTokenAddress, account]
    )
    const result = await this.ethCall(
      chainId,
      params.redemptionVaultAddress,
      data
    )
    const decoded = this.rwaRedemptionVaultInterface.decodeFunctionResult(
      'previewRedeem',
      result
    )

    return {
      units: BigInt(decoded[0].toString()).toString(),
      payoutAmount: BigInt(decoded[1].toString()).toString(),
    }
  }

  async getRewardTokens(params: {
    networkId: string
    interestVaultAddress: string
    productId: bigint | number | string
  }): Promise<string[]> {
    this.assertHexAddress(params.interestVaultAddress, 'interestVaultAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const productId = this.toBigInt(params.productId, 'productId')

    const data = this.rwaInterestVaultInterface.encodeFunctionData(
      'getRewardTokens',
      [productId]
    )
    const result = await this.ethCall(chainId, params.interestVaultAddress, data)
    const decoded = this.rwaInterestVaultInterface.decodeFunctionResult(
      'getRewardTokens',
      result
    )
    return (decoded[0] as string[]).map((token) => token.toLowerCase())
  }

  async getPayoutTokens(params: {
    networkId: string
    redemptionVaultAddress: string
    productId: bigint | number | string
  }): Promise<string[]> {
    this.assertHexAddress(params.redemptionVaultAddress, 'redemptionVaultAddress')
    const chainId = await this.resolveChainId(params.networkId)
    const productId = this.toBigInt(params.productId, 'productId')

    const data = this.rwaRedemptionVaultInterface.encodeFunctionData(
      'getPayoutTokens',
      [productId]
    )
    const result = await this.ethCall(
      chainId,
      params.redemptionVaultAddress,
      data
    )
    const decoded = this.rwaRedemptionVaultInterface.decodeFunctionResult(
      'getPayoutTokens',
      result
    )
    return (decoded[0] as string[]).map((token) => token.toLowerCase())
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
