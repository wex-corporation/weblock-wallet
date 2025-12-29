import { BlockchainRequest } from '@/clients/types'
import {
    NetworkInfo,
    SendTransactionParams,
    TokenAllowanceParams,
    TokenApprovalParams,
    TokenBalance,
    TokenBalanceParams,
    TokenInfo,
    TokenInfoParams,
    Transaction,
    TransferRequest,
    TransferResponse,
} from '../types'
import { TokenMetadata } from './services/asset'

export interface InternalCore {
    auth: {
        signIn(provider: string): Promise<{
            isNewUser: boolean
            email: string
            photoURL: string | null
            status: 'WALLET_READY' | 'NEEDS_PASSWORD' | 'NEW_USER'
        }>
        signOut(): Promise<void>
        isLoggedIn(): Promise<boolean>
        getAuthInfo(): Promise<{
            firebaseId?: string
            accessToken?: string
            isNewUser?: boolean
        }>
        clearNewUserFlag(): Promise<void>
    }

    wallet: {
        getAddress(): Promise<string>
        create(password: string): Promise<string>
        retrieveWallet(password: string): Promise<string>

        /**
         * PIN을 모르는 상태에서(연속 실패 등) 같은 디바이스에 남아있는
         * 복구용 share2(encryptedShare2_device)를 이용해 PIN을 재설정합니다.
         * - 프라이빗키/주소는 유지됩니다.
         * - 로컬 복구 데이터가 없으면 RECOVERY_NOT_AVAILABLE 에러가 발생합니다.
         */
        resetPin(newPassword: string): Promise<string>

        getBalance(address: string, chainId: number): Promise<TokenBalance>
        getTokenBalance(
            tokenAddress: string,
            walletAddress: string,
            chainId: number
        ): Promise<TokenBalance>
        sendTransaction(params: SendTransactionParams): Promise<string>
        getTransactionCount(address: string, chainId: number): Promise<number>
        getBlockNumber(chainId: number): Promise<number>
        sendRawTransaction(signedTx: string, chainId: number): Promise<string>
        getTransactionReceipt(txHash: string, chainId: number): Promise<any>
        getTransaction(txHash: string, chainId: number): Promise<any>
        estimateGas(txParams: any, chainId: number): Promise<number>
        getGasPrice(chainId: number): Promise<string>
        call(
            txParams: any,
            blockParam: string | number,
            chainId: number
        ): Promise<string>
        getLatestTransaction(
            address: string,
            chainId: number
        ): Promise<Transaction | undefined>
    }

    network: {
        getRegisteredNetworks(): Promise<NetworkInfo[]>
        getCurrentNetwork(): Promise<NetworkInfo | null>
        registerNetwork(params: BlockchainRequest): Promise<void>
        switchNetwork(networkId: string): Promise<void>
    }

    asset: {
        transfer: (params: TransferRequest) => Promise<TransferResponse>
        addToken: (params: {
            type: 'ERC20' | 'SECURITY'
            networkId: string
            address: string
            symbol?: string
            decimals?: number
            name?: string
        }) => Promise<void>
        getTokenBalance: (params: TokenBalanceParams) => Promise<string>
        approveToken: (params: TokenApprovalParams) => Promise<string>
        getAllowance: (params: TokenAllowanceParams) => Promise<string>
        addNFTCollection: (params: {
            networkId: string
            address: string
            name?: string
        }) => Promise<void>
        on(event: string, listener: (...args: any[]) => void): void
        off(event: string, listener: (...args: any[]) => void): void
        getTokenInfo(params: TokenInfoParams): Promise<TokenMetadata>
        registerToken(params: { networkId: string; tokenAddress: string }): Promise<void>
        getTokenFullInfo(params: {
            networkId: string
            tokenAddress: string
            walletAddress: string
        }): Promise<TokenInfo>
    }
}
