// client/src/core/internal.ts

import {
  SDKOptions,
  SendTransactionParams,
  TokenAllowanceParams,
  TokenApprovalParams,
  TokenBalanceParams,
  ERC1155BalanceParams,
  RbtClaimableParams,
  RbtClaimParams,
  TokenInfoParams,
  TransferRequest,
} from '../types'
import { InternalCore } from './types'
import { AuthService } from './services/auth'
import { WalletService } from './services/wallet'
import { NetworkService } from './services/network'
import { HttpClient } from '../clients/http'
import { FirebaseAuth } from './auth/firebase'
import { UserClient } from '../clients/api/users'
import { WalletClient } from '../clients/api/wallets'
import { BlockchainRequest } from '@/clients/types'
import { RpcClient } from '../clients/api/rpcs'
import { AssetService } from './services/asset'
import { InvestmentService } from './services/investment'

export class InternalCoreImpl implements InternalCore {
  private readonly authService: AuthService
  private readonly walletService: WalletService
  private readonly networkService: NetworkService
  private readonly assetService: AssetService
  private readonly investmentService: InvestmentService

  constructor(private readonly options: SDKOptions) {
    const httpClient = new HttpClient(options)
    const firebase = new FirebaseAuth(options)
    const userClient = new UserClient(httpClient)
    const walletClient = new WalletClient(httpClient)
    const rpcClient = new RpcClient(httpClient)

    this.authService = new AuthService(
      firebase,
      userClient,
      walletClient,
      options.orgHost
    )

    this.networkService = new NetworkService(userClient, options.orgHost)

    this.walletService = new WalletService(
      walletClient,
      rpcClient,
      options.orgHost,
      this.networkService
    )

    this.assetService = new AssetService(
      rpcClient,
      this.walletService,
      this.networkService,
      userClient,
      options.orgHost
    )

    this.investmentService = new InvestmentService(
      rpcClient,
      this.walletService,
      this.networkService
    )
  }

  auth = {
    signIn: (provider: string) => this.authService.signIn(provider),
    signOut: () => this.authService.signOut(),
    isLoggedIn: () => this.authService.isLoggedIn(),
    getAuthInfo: () => this.authService.getAuthInfo(),
    clearNewUserFlag: () => this.authService.clearNewUserFlag(),
  }

  wallet = {
    getAddress: () => this.walletService.getAddress(),
    create: (password: string) => this.walletService.create(password),
    retrieveWallet: (password: string) =>
      this.walletService.retrieveWallet(password),

    // Fix: expose resetPin to InternalCore wallet facade
    resetPin: (newPassword: string) => this.walletService.resetPin(newPassword),

    getBalance: (address: string, chainId: number) =>
      this.walletService.getBalance(address, chainId),
    getTokenBalance: (
      tokenAddress: string,
      walletAddress: string,
      chainId: number
    ) =>
      this.walletService.getTokenBalance(tokenAddress, walletAddress, chainId),
    sendTransaction: (params: SendTransactionParams) =>
      this.walletService.sendTransaction(params),
    getTransactionCount: (address: string, chainId: number) =>
      this.walletService.getTransactionCount(address, chainId),
    getBlockNumber: (chainId: number) =>
      this.walletService.getBlockNumber(chainId),
    sendRawTransaction: (signedTx: string, chainId: number) =>
      this.walletService.sendRawTransaction(signedTx, chainId),
    getTransactionReceipt: (txHash: string, chainId: number) =>
      this.walletService.getTransactionReceipt(txHash, chainId),
    getTransaction: (txHash: string, chainId: number) =>
      this.walletService.getTransaction(txHash, chainId),
    estimateGas: (txParams: any, chainId: number) =>
      this.walletService.estimateGas(txParams, chainId),
    getGasPrice: (chainId: number) => this.walletService.getGasPrice(chainId),
    call: (txParams: any, blockParam: string | number, chainId: number) =>
      this.walletService.call(txParams, blockParam, chainId),
    getLatestTransaction: (address: string, chainId: number) =>
      this.walletService.getLatestTransaction(address, chainId),
  }

  network = {
    getRegisteredNetworks: () => this.networkService.getRegisteredNetworks(),
    registerNetwork: (params: BlockchainRequest) =>
      this.networkService.registerNetwork(params),
    switchNetwork: (networkId: string) =>
      this.networkService.switchNetwork(networkId),
    getCurrentNetwork: () => this.networkService.getCurrentNetwork(),
  }

  investment = {
    getOffering: (params: any) => this.investmentService.getOffering(params),
    investRbtWithUsdr: (params: any) =>
      this.investmentService.investRbtWithUsdr(params),
    claimRbtRevenue: (params: any) =>
      this.investmentService.claimRbtRevenue(params),
    getClaimable: (params: any) => this.investmentService.getClaimable(params),
    getRbtBalance: (params: any) => this.investmentService.getRbtBalance(params),
    getRwaOffering: (params: any) =>
      this.investmentService.getRwaOffering(params),
    buyRwaProduct: (params: any) => this.investmentService.buyRwaProduct(params),
    claimRwaInterest: (params: any) =>
      this.investmentService.claimRwaInterest(params),
    claimAllRwaInterest: (params: any) =>
      this.investmentService.claimAllRwaInterest(params),
    getClaimableRwaInterest: (params: any) =>
      this.investmentService.getClaimableRwaInterest(params),
    getRwaBalance: (params: any) => this.investmentService.getRwaBalance(params),
    redeemRwa: (params: any) => this.investmentService.redeemRwa(params),
    previewRedeemRwa: (params: any) =>
      this.investmentService.previewRedeemRwa(params),
    getRewardTokens: (params: any) =>
      this.investmentService.getRewardTokens(params),
    getPayoutTokens: (params: any) =>
      this.investmentService.getPayoutTokens(params),
    on: (event: string, listener: (...args: any[]) => void) =>
      this.investmentService.on(event, listener),
    off: (event: string, listener: (...args: any[]) => void) =>
      this.investmentService.off(event, listener),
  }

  asset = {
    transfer: (params: TransferRequest) => this.assetService.transfer(params),

    addToken: (params: {
      type: 'ERC20' | 'SECURITY'
      networkId: string
      address: string
      symbol?: string
      decimals?: number
      name?: string
    }) => this.assetService.addToken(params),

    getTokenBalance: (params: TokenBalanceParams) =>
      this.assetService.getTokenBalance(params),

    getERC1155Balance: (params: ERC1155BalanceParams) =>
      this.assetService.getERC1155Balance(params),

    getRbtClaimable: (params: RbtClaimableParams) =>
      this.assetService.getRbtClaimable(params),

    claimRbt: (params: RbtClaimParams) => this.assetService.claimRbt(params),

    approveToken: (params: TokenApprovalParams) =>
      this.assetService.approveToken(params),

    getAllowance: (params: TokenAllowanceParams) =>
      this.assetService.getAllowance(params),

    addNFTCollection: (params: {
      networkId: string
      address: string
      name?: string
    }) => this.assetService.addNFTCollection(params),

    on: (event: string, listener: (...args: any[]) => void) =>
      this.assetService.on(event, listener),

    off: (event: string, listener: (...args: any[]) => void) =>
      this.assetService.off(event, listener),

    getTokenInfo: (params: TokenInfoParams) =>
      this.assetService.getTokenInfo(params),

    registerToken: (params: { networkId: string; tokenAddress: string }) =>
      this.assetService.registerToken(params),

    getTokenFullInfo: (params: {
      networkId: string
      tokenAddress: string
      walletAddress: string
    }) => this.assetService.getTokenFullInfo(params),

    getRegisteredCoins: (networkId: string) =>
      this.assetService.getRegisteredCoins(networkId),
  }
}
