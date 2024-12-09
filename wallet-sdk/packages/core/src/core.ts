import { WalletApiClient } from './clients/wallets';
import { UserApiClient } from './clients/users';
import { RpcApiClient } from './clients/rpcs';
import { Wallets } from './modules/wallets';
import { Users } from './modules/users';
import { SecureStorage } from './utils/storage';
import { Blockchain } from './types';

interface CoreOptions {
  baseURL: string;
  apiKey: string;
  orgHost: string;
}

export class Core {
  private readonly storage = SecureStorage.getInstance();
  private readonly walletClient: WalletApiClient;
  private readonly userClient: UserApiClient;
  private readonly rpcClient: RpcApiClient;

  private readonly wallets: Wallets;
  private readonly users: Users;

  constructor(options: CoreOptions) {
    // 클라이언트 초기화
    this.walletClient = new WalletApiClient(options);
    this.userClient = new UserApiClient(options);
    this.rpcClient = new RpcApiClient(options);

    // 모듈 초기화
    this.wallets = new Wallets(this.walletClient, this.rpcClient, this.storage);
    this.users = new Users(this.userClient);

    console.log('[Core] Initialized successfully');
  }

  // 지갑 관련 메서드
  async createWallet(password: string): Promise<void> {
    return this.wallets.createWallet(password);
  }

  async getBalance(chainId: number): Promise<string> {
    return this.wallets.getBalance(chainId);
  }

  // 사용자 관련 메서드
  async getBlockchains(): Promise<Blockchain[]> {
    return this.users.getRegisteredBlockchains();
  }
}
