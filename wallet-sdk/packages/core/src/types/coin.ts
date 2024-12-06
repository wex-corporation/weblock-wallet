export interface CoinDTO {
  id: string;
  orgId: string;
  blockchainId: string;
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterTokenRequest {
  blockchainId: string;
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
}
