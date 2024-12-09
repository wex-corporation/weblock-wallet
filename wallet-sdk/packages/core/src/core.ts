import { WalletApiClient } from './clients/wallets';
import { UserApiClient } from './clients/users';
import { RpcApiClient } from './clients/rpcs';
import { Wallets } from './modules/wallets';
import { Users } from './modules/users';
import { SecureStorage } from './utils/storage';
import { Blockchain, CoreOptions, Environment } from './types';

export class Core {
  private readonly storage = SecureStorage.getInstance();
  private readonly walletClient: WalletApiClient;
  private readonly userClient: UserApiClient;
  private readonly rpcClient: RpcApiClient;
  private readonly wallets: Wallets;
  private readonly users: Users;

  constructor(options: CoreOptions) {
    const baseURL = options.baseURL || this.getBaseUrlForEnv(options.env);
    const clientOptions = {
      baseURL,
      apiKey: options.apiKey,
      orgHost: options.orgHost,
    };

    // 클라이언트 초기화
    this.walletClient = new WalletApiClient(clientOptions);
    this.userClient = new UserApiClient(clientOptions);
    this.rpcClient = new RpcApiClient(clientOptions);

    // 모듈 초기화
    this.wallets = new Wallets(this.walletClient, this.rpcClient, this.storage);
    this.users = new Users(this.userClient);

    console.log('[Core] Initialized successfully');
  }

  private getBaseUrlForEnv(env: Environment): string {
    const baseUrls = {
      local: 'http://localhost:3000',
      dev: 'https://dev-api.example.com',
      stage: 'https://stage-api.example.com',
      prod: 'https://api.example.com',
    };
    return baseUrls[env];
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
