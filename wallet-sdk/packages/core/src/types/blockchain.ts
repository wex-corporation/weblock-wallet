/**
 * 블록체인 정보 DTO
 */
export interface BlockchainDTO {
  id: string; // UUID
  orgId: string; // 조직 ID
  name: string; // 블록체인 이름 (e.g., "Ethereum Mainnet")
  chainId: number; // 체인 ID (e.g., 1 for Ethereum Mainnet)
  rpcUrl: string; // RPC URL
  currencySymbol: string; // 기본 통화 심볼 (e.g., "ETH")
  currencyName: string; // 기본 통화 이름 (e.g., "Ethereum")
  explorerUrl?: string; // 블록 익스플로러 URL (optional)
  isTestnet: boolean; // 테스트넷 여부
  createdAt: string; // 생성 시간
  updatedAt: string; // 수정 시간
}

/**
 * 블록체인 등록 요청
 */
export interface RegisterBlockchainRequest {
  name: string;
  rpcUrl: string;
  chainId: number;
  currencySymbol: string;
  currencyName: string;
  explorerUrl?: string;
  isTestnet?: boolean;
}

export interface Blockchain {
  id: string;
  name: string;
  rpcUrl: string;
  chainId: number;
  currencySymbol: string;
  currencyName: string;
  currencyDecimals: number;
  explorerUrl: string;
  isTestnet: boolean;
}
