// src/types/index.ts

/**
 * SDK 초기화 옵션
 */
export interface SDKOptions {
  /** SDK 환경 설정 (local, dev, stage, prod) */
  environment: 'local' | 'dev' | 'stage' | 'prod'
  /** SDK API 키 */
  apiKey: string
  /** 허용 호스트 */
  orgHost: string
}

/**
 * 토큰 타입
 */
export enum TokenType {
  /** ERC20 토큰 */
  ERC20 = 'ERC20',
  /** 보안토큰 */
  SECURITY = 'SECURITY',
  /** 네이티브 토큰 */
  NATIVE = 'NATIVE',
}

/**
 * 트랜잭션 상태
 */
export enum TransactionStatus {
  /** 처리 중 */
  PENDING = 'PENDING',
  /** 성공 */
  SUCCESS = 'SUCCESS',
  /** 실패 */
  FAILED = 'FAILED',
}

/**
 * 트랜잭션 타입
 */
export enum TransactionType {
  /** 송금 */
  SEND = 'SEND',
  /** 수금 */
  RECEIVE = 'RECEIVE',
}

/**
 * 로그인 상태
 */
export enum SignInStatus {
  /** 신규 사용자 */
  NEW_USER = 'NEW_USER',
  /** 지갑 준비됨 */
  WALLET_READY = 'WALLET_READY',
  /** 비밀번호 필요 */
  NEEDS_PASSWORD = 'NEEDS_PASSWORD',
}

/**
 * 네트워크 정보
 */
export interface NetworkInfo {
  /** 네트워크 고유 식별자 */
  id: string
  /** 네트워크 표시 이름 */
  name: string
  /** 체인 ID */
  chainId: number
  /** 네트워크 기본 토큰 심볼 */
  symbol: string
  /** RPC 엔드포인트 */
  rpcUrl: string
  /** 블록 익스플로러 URL */
  explorerUrl: string
  /** 테스트넷 여부 */
  isTestnet: boolean
  /** 네트워크 아이콘 URL */
  icon?: string
  /** 네트워크 기본 토큰 소수점 자리수 */
  decimals: number
}

/**
 * 토큰 잔액 정보
 */
export interface TokenBalance {
  /** 원본 값 (Wei) */
  raw: string
  /** 변환된 값 */
  formatted: string
  /** 소수점 자리수 */
  decimals: number
  /** 토큰 심볼 */
  symbol: string
}

/**
 * 토큰 정보
 */
export interface TokenInfo {
  /** 토큰 심볼 */
  symbol: string
  /** 토큰 이름 */
  name: string
  /** 컨트랙트 주소 */
  address: string
  /** 토큰 잔액 */
  balance: TokenBalance
  /** 토큰 소수점 자리수 */
  decimals: number
  /** 토큰 총 발행량 */
  totalSupply: TokenBalance
}

/**
 * NFT 컬렉션 정보 (TODO: ERC721 구현 시 확장)
 */
export interface NFTCollection {
  /** 컬렉션 이름 */
  name: string
  /** 컨트랙트 주소 */
  address: string
  /** 보유 중인 NFT 목록 */
  tokens: Array<{
    /** 토큰 ID */
    tokenId: string
    /** NFT 이미지 URL */
    image?: string
  }>
}

/**
 * 보안토큰 정보 (TODO: ERC3643 구현 시 확장)
 */
export interface SecurityTokenInfo {
  /** 토큰 심볼 */
  symbol: string
  /** 토큰 이름 */
  name: string
  /** 컨트랙트 주소 */
  address: string
  /** 토큰 잔액 */
  balance: string | null
  /** 토큰 소수점 자리수 */
  decimals: number
  /** 토큰 총 발행량 */
  totalSupply: string
  /** 컴플라이언스 정보 */
  compliance: {
    /** 검증 여부 */
    isVerified: boolean
    /** 전송 가능 여부 */
    canTransfer: boolean
  }
}

/**
 * 트랜잭션 정보
 */
export interface Transaction {
  /** 트랜잭션 해시 */
  hash: string
  /** 트랜잭션 타입 */
  type: TransactionType
  /** 트랜잭션 상태 */
  status: TransactionStatus
  /** 트랜잭션 타임스탬프 */
  timestamp: number
  /** 거래 금액 */
  value: string
  /** 토큰 심볼 */
  symbol: string
}

/**
 * 지갑 정보
 */
export interface WalletInfo {
  /** 지갑 주소 */
  address: string
  /** 네트워크 정보 */
  network: {
    /** 현재 선택된 네트워크 */
    current: NetworkInfo | null
    /** 사용 가능한 네트워크 목록 */
    available: NetworkInfo[]
  }
  /** 자산 정보 */
  assets: {
    /** 현재 네트워크의 기본 토큰 정보 */
    native: {
      symbol: string
      balance: TokenBalance
      decimals: number
    }
    /** ERC20 토큰 목록 */
    tokens: TokenInfo[]
    /** NFT 컬렉션 목록 */
    nfts: NFTCollection[]
    /** 보안토큰 목록 */
    securities: SecurityTokenInfo[]
  }
  /** 최근 트랜잭션 */
  latestTransaction?: Transaction
}

/**
 * 로그인 응답
 */
export interface SignInResponse {
  /** 로그인 상태 */
  status: SignInStatus
  /** 사용자 이메일 */
  email: string
  /** 프로필 이미지 URL */
  photoURL: string | null
  /** 지갑 정보 (WALLET_READY 상태일 때만) */
  wallet?: WalletInfo
}

/**
 * 지갑 생성/복구 응답
 */
export interface WalletResponse {
  /** 지갑 정보 */
  wallet: WalletInfo
}

/**
 * 네트워크 변경 응답
 */
export interface SwitchNetworkResponse {
  network: NetworkInfo
  assets: WalletInfo['assets']
}

/**
 * 토큰 전송 요청
 */
export interface TransferRequest {
  /** 네트워크 ID */
  networkId: string
  /** 토큰 컨트랙트 주소 */
  tokenAddress: string
  /** 수신자 주소 */
  to: string
  /** 전송 금액 */
  amount: string
  /** 토큰 타입 */
  type: 'NATIVE' | 'ERC20'
  /** 토큰 심볼 */
  symbol?: string
}

/**
 * 토큰 전송 응답
 */
export interface TransferResponse {
  transaction: Transaction
}

/**
 * 네트워크 등록 요청
 */
export interface AddNetworkRequest {
  /** 네트워크 이름 (예: "Ethereum Mainnet", "Polygon Mumbai") */
  name: string
  /** RPC URL */
  rpcUrl: string
  /** 체인 ID */
  chainId: number
}

export interface TokenBalanceParams {
  networkId: string
  tokenAddress: string
  walletAddress: string
}

export interface TokenApprovalParams {
  networkId: string
  tokenAddress: string
  spender: string
  amount: string
}

export interface TokenAllowanceParams {
  networkId: string
  tokenAddress: string
  owner: string
  spender: string
}

export interface TokenInfoParams {
  networkId: string
  tokenAddress: string
}

export interface SendTransactionParams {
  to: string
  value: string
  data?: string
  chainId: number
  gasLimit?: string
  gasPrice?: string
  nonce?: number
}

export interface TransactionReceipt {
  transactionHash: string
  transactionIndex: string
  blockHash: string
  blockNumber: string
  from: string
  to: string
  cumulativeGasUsed: string
  gasUsed: string
  contractAddress: string | null
  logs: Array<Log>
  status: string // '0x1' for success, '0x0' for failure
  logsBloom: string
  effectiveGasPrice?: string
}

interface Log {
  address: string
  topics: string[]
  data: string
  blockNumber: string
  transactionHash: string
  transactionIndex: string
  blockHash: string
  logIndex: string
  removed: boolean
}

export * from './error'
