// src/types/index.ts

/**
 * SDK 초기화 옵션
 */
export interface SDKOptions {
  /** SDK 환경 설정 */
  environment: 'local' | 'dev' | 'stage' | 'prod'
  /** SDK API 키 */
  apiKey: string
  /** 조직 호스트 주소 */
  orgHost: string
}

/**
 * 네트워크 정보
 */
export interface NetworkInfo {
  /** 네트워크 고유 식별자 */
  id: string // 'ethereum-mainnet', 'polygon-mainnet'
  /** 네트워크 표시 이름 */
  name: string // 'Ethereum Mainnet', 'Polygon Mainnet'
  /** 체인 ID */
  chainId: number // 1, 137
  /** 네트워크 기본 토큰 심볼 */
  symbol: string // 'ETH', 'MATIC'
  /** RPC 엔드포인트 */
  rpcUrl: string
  /** 블록 익스플로러 URL */
  explorerUrl: string
  /** 테스트넷 여부 */
  isTestnet: boolean
  /** 네트워크 아이콘 URL (옵션) */
  icon?: string
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
    current: NetworkInfo
    /** 사용 가능한 네트워크 목록 */
    available: NetworkInfo[]
  }

  /** 자산 정보 */
  assets: {
    /** 현재 네트워크의 기본 토큰 정보 */
    native: {
      symbol: string
      balance: string
      decimals: number
      usdValue?: string
    }

    /** 토큰 목록 (ERC20, Security Token) */
    tokens: TokenInfo[]

    /** NFT 컬렉션 목록 */
    nfts: NFTCollection[]
  }

  /** 최근 거래 내역 */
  recentTransactions: Transaction[]
}

/**
 * 토큰 정보
 */
export interface TokenInfo {
  /** 토큰 타입 */
  type: 'ERC20' | 'SECURITY'
  /** 토큰 심볼 */
  symbol: string
  /** 토큰 이름 */
  name: string
  /** 컨트랙트 주소 */
  address: string
  /** 토큰 잔액 */
  balance: string
  /** 토큰 소수점 자리수 */
  decimals: number
  /** USD 가치 (옵션) */
  usdValue?: string
  /** Security 토큰 컴플라이언스 정보 */
  compliance?: {
    isVerified: boolean
    canTransfer: boolean
  }
}

/**
 * NFT 컬렉션 정보
 */
export interface NFTCollection {
  /** 컬렉션 이름 */
  name: string
  /** 컨트랙트 주소 */
  address: string
  /** 보유 중인 NFT 목록 */
  tokens: {
    /** 토큰 ID */
    tokenId: string
    /** NFT 이미지 URL */
    image?: string
  }[]
}

/**
 * 트랜잭션 정보
 */
export interface Transaction {
  /** 트랜잭션 해시 */
  hash: string
  /** 트랜잭션 타입 */
  type: 'send' | 'receive'
  /** 트랜잭션 상태 */
  status: 'pending' | 'confirmed' | 'failed'
  /** 트랜잭션 타임스탬프 */
  timestamp: number
  /** 거래 금액 */
  value: string
  /** 토큰 심볼 */
  symbol: string
}

/**
 * 로그인 응답
 */
export interface SignInResponse {
  /** 로그인 상태 */
  status: 'NEW_USER' | 'WALLET_READY' | 'NEEDS_PASSWORD'
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
  type: 'NATIVE' | 'ERC20' | 'NFT' | 'SECURITY'
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

export * from './error'
