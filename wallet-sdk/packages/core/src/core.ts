import { WalletApiClient } from './clients/wallets';
import { UserApiClient } from './clients/users';
import { RpcApiClient } from './clients/rpcs';
import { Wallets } from './modules/wallets';
import { Users } from './modules/users';
import { Blockchain, CoreOptions, Environment } from './types';
import { IHttpProvider } from './providers/interfaces/http';
import { ICryptoProvider } from './providers/interfaces/crypto';
import { IStorageProvider } from './providers/interfaces/storage';

export class Core {
  private readonly wallets: Wallets;
  private readonly users: Users;

  constructor(
    private readonly httpProvider: IHttpProvider,
    private readonly cryptoProvider: ICryptoProvider,
    private readonly storageProvider: IStorageProvider,
    options: CoreOptions
  ) {
    const baseURL = options.baseURL || this.getBaseUrlForEnv(options.env);

    const clientOptions = {
      baseURL,
      apiKey: options.apiKey,
      orgHost: options.orgHost,
      timeout: 30000,
    };

    // 클라이언트 초기화
    const walletClient = new WalletApiClient(clientOptions, this.httpProvider);
    const userClient = new UserApiClient(clientOptions, this.httpProvider);
    const rpcClient = new RpcApiClient(clientOptions, this.httpProvider);

    // 모듈 초기화
    this.wallets = new Wallets(walletClient, rpcClient, this.storageProvider);
    this.users = new Users(userClient);

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
