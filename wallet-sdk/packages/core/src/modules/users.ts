import { UserApiClient } from '../clients/users';
import { Blockchain } from '../types/blockchain';
import { Coin } from '../types/coin';

export interface RegisterBlockchainParams {
  name: string;
  rpcUrl: string;
  chainId: number;
  currencySymbol: string;
  currencyName: string;
  currencyDecimals: number;
  explorerUrl: string;
  isTestnet: boolean;
}

export interface RegisterTokenParams {
  blockchainId: string;
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
}

export class Users {
  private userClient: UserApiClient;

  constructor(apiConfig: { baseURL: string; apiKey: string; orgHost: string }) {
    this.userClient = new UserApiClient(apiConfig);
  }

  // @ts-ignore 타입 이슈는 나중에 해결
  async registerBlockchain(params: any): Promise<void> {
    return await this.userClient.registerBlockchain(params);
  }

  // @ts-ignore 타입 이슈는 나중에 해결
  async getRegisteredBlockchains(): Promise<any[]> {
    return await this.userClient.getRegisteredBlockchains();
  }

  // @ts-ignore 타입 이슈는 나중에 해결
  async registerToken(params: any): Promise<any> {
    return await this.userClient.registerToken(params);
  }

  // @ts-ignore 타입 이슈는 나중에 해결
  async getRegisteredCoins(blockchainId: string): Promise<any[]> {
    return await this.userClient.getRegisteredCoins(blockchainId);
  }
}
