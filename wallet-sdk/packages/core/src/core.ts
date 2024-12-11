import { WalletApiClient } from './clients/wallets';
import { UserApiClient } from './clients/users';
import { RpcApiClient } from './clients/rpcs';
import { Wallets } from './modules/wallets';
import { Users } from './modules/users';
import { SecureStorage } from './utils/storage';
import { defaultConfig } from './config';
import { CoreOptions } from './types';

export class Core {
  private readonly storage = SecureStorage.getInstance();
  private readonly walletClient: WalletApiClient;
  private readonly userClient: UserApiClient;
  private readonly rpcClient: RpcApiClient;

  private readonly wallets: Wallets;
  private readonly users: Users;

  public readonly modules: {
    wallets: Wallets;
    users: Users;
  };

  constructor(options: CoreOptions) {
    const baseURL = options.baseURL || defaultConfig.baseUrls[options.env];

    // Initialize API clients
    this.walletClient = new WalletApiClient({
      baseURL,
      apiKey: options.apiKey,
      orgHost: options.orgHost,
    });

    this.userClient = new UserApiClient({
      baseURL,
      apiKey: options.apiKey,
      orgHost: options.orgHost,
    });

    this.rpcClient = new RpcApiClient({
      baseURL,
      apiKey: options.apiKey,
      orgHost: options.orgHost,
    });

    // Initialize modules
    this.wallets = new Wallets(this.walletClient, this.rpcClient, this.storage);
    this.users = new Users(this.userClient);

    // Expose public modules
    this.modules = {
      wallets: this.wallets,
      users: this.users,
    };
  }
}
