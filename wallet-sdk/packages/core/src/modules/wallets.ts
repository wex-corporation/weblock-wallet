import { WalletApiClient } from '../clients/wallets';
import { Secrets } from '../utils/secrets';
import { WalletError } from '../errors';
import { Wallet } from 'ethers';
import { generateMnemonic, mnemonicToSeed } from 'bip39';
import { CreateWalletRequest, WalletDTO } from '../types/wallet';
import * as crypto from 'crypto';
import { RpcApiClient } from '../clients/rpcs';
import { IStorageProvider } from '../providers/interfaces/storage';

export class Wallets {
  private wallet: Wallet | null = null;
  private readonly walletClient: WalletApiClient;
  private readonly rpcClient: RpcApiClient;
  private readonly storage: IStorageProvider;
  private readonly secrets: Secrets;

  constructor(
    walletClient: WalletApiClient,
    rpcClient: RpcApiClient,
    storage: IStorageProvider
  ) {
    this.walletClient = walletClient;
    this.rpcClient = rpcClient;
    this.storage = storage;
    this.secrets = Secrets.getInstance();
  }

  /**
   * 새로운 지갑 생성
   * @param userPassword 사용자 비밀번호
   * @throws {WalletError} 지갑 생성 실패시
   */
  async createWallet(userPassword: string): Promise<void> {
    try {
      const firebaseId = await this.storage.getItem<string>('firebaseId');
      if (!firebaseId) {
        throw new Error('FirebaseId not found. May not be logged in yet');
      }

      // 1. 니모닉 생성 및 시드 생성
      const mnemonic = generateMnemonic();
      const seed = await mnemonicToSeed(mnemonic);

      // 2. 시드에서 지갑 생성
      this.wallet = new Wallet(seed.slice(0, 32).toString('hex'));
      const privateKeyHex = this.wallet.privateKey;
      const publicKey = this.wallet.signingKey.publicKey;

      // 3. 개인키를 3개의 조각으로 분할 (2개로 복구 가능)
      const shares = await this.secrets.split(privateKeyHex, 3, 2);
      const [share1, share2, share3] = shares;

      // 4. share2를 로컬에 암호화해서 저장
      const encryptedShare2 = this.encryptShare(
        share2,
        userPassword,
        firebaseId
      );
      await this.storage.setItem('encryptedShare2', encryptedShare2);

      // 5. share3를 서버에 암호화해서 저장
      const encryptedShare3 = this.encryptShare(
        share3,
        userPassword,
        firebaseId
      );

      // 6. 지갑 생성 요청
      const request: CreateWalletRequest = {
        address: this.wallet.address,
        publicKey,
        share1,
        encryptedShare3,
      };

      await this.walletClient.createWallet(request);
    } catch (error) {
      throw new WalletError('Failed to create wallet', {
        cause: error as Error,
      });
    }
  }

  /**
   * 지갑 정보 조회
   * @throws {WalletError} 지갑 조회 실패시
   */
  async getWallet(): Promise<WalletDTO> {
    try {
      const wallet = await this.walletClient.getWallet();
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      return wallet;
    } catch (error) {
      throw new WalletError('Failed to get wallet', { cause: error as Error });
    }
  }

  /**
   * 지갑 잔액 조회
   * @param chainId 블록체인 체인 ID
   * @throws {WalletError} 잔액 조회 실패시
   */
  async getBalance(chainId: number): Promise<string> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not initialized');
      }

      // RPC�� 통해 잔액 조회
      const response = await this.rpcClient.getBalance(
        chainId,
        this.wallet.address
      );

      if (response.error !== undefined) {
        throw new Error(response.error.message);
      }

      if (response.result === undefined) {
        throw new Error('No result in response');
      }

      return response.result;
    } catch (error) {
      throw new WalletError('Failed to get balance', { cause: error as Error });
    }
  }

  /**
   * 키 조각 암호화
   * @param share 암호화할 키 조각
   * @param password 사용자 비밀번호
   * @param salt 솔트 (firebaseId)
   */
  private encryptShare(share: string, password: string, salt: string): string {
    try {
      // 1. PBKDF2로 키 생성
      const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');

      // 2. 랜덤 IV 생성
      const iv = crypto.randomBytes(16);

      // 3. AES-256-CBC 암호화
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(share, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new WalletError('Failed to encrypt share', {
        cause: error as Error,
      });
    }
  }

  /**
   * 암호화된 키 조각 복호화
   * @param encryptedShare 암호화된 키 조각
   * @param password 사용자 비밀번호
   * @param salt 솔트 (firebaseId)
   */
  private decryptShare(
    encryptedShare: string,
    password: string,
    salt: string
  ): string {
    try {
      // 1. IV와 암호화된 데이터 분리
      const [ivHex, encrypted] = encryptedShare.split(':');
      const iv = Buffer.from(ivHex, 'hex');

      // 2. PBKDF2로 키 생성
      const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');

      // 3. AES-256-CBC 복호화
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'unable to decrypt data'
      ) {
        throw new WalletError('Wrong password');
      }
      throw new WalletError('Failed to decrypt share', {
        cause: error as Error,
      });
    }
  }

  /**
   * 지갑 복구
   * @param userPassword 사용자 비밀번호
   * @throws {WalletError} 지갑 복구 실패시
   */
  async retrieveWallet(userPassword: string): Promise<void> {
    try {
      const firebaseId = await this.storage.getItem<string>('firebaseId');
      if (!firebaseId) {
        throw new Error('FirebaseId not found. May not be logged in yet');
      }

      // 1. 서버에서 지갑 정보 조회
      const wallet = await this.walletClient.getWallet();
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // 2. 로컬에서 암호화된 share2 가져오기
      const encryptedShare2 =
        await this.storage.getItem<string>('encryptedShare2');
      if (!encryptedShare2) {
        // share2가 없으면 share3 사용
        const decryptedShare3 = this.decryptShare(
          wallet.encryptedShare3,
          userPassword,
          firebaseId
        );

        // share1과 share3로 개인키 복구
        const privateKey = await this.secrets.combine([
          wallet.share1,
          decryptedShare3,
        ]);
        this.wallet = new Wallet(privateKey);

        // share2 다시 저장
        const shares = await this.secrets.split(privateKey, 3, 2);
        const encryptedNewShare2 = this.encryptShare(
          shares[1],
          userPassword,
          firebaseId
        );
        await this.storage.setItem('encryptedShare2', encryptedNewShare2);
      } else {
        // share2 복호화
        const decryptedShare2 = this.decryptShare(
          encryptedShare2,
          userPassword,
          firebaseId
        );

        // share1과 share2로 개인키 복구
        const privateKey = await this.secrets.combine([
          wallet.share1,
          decryptedShare2,
        ]);
        this.wallet = new Wallet(privateKey);

        // 주소 검증 및 갱신
        if (
          this.wallet.address.toLowerCase() !== wallet.address.toLowerCase()
        ) {
          console.log(
            'Key refresh detected from other device/browser. Refreshing key for this device/browser.'
          );
          await this.refreshWallet(wallet, userPassword);
        }
      }
    } catch (error) {
      throw new WalletError('Failed to retrieve wallet', {
        cause: error as Error,
      });
    }
  }

  /**
   * 지갑 키 갱신
   * @param wallet 서버에서 받은 지갑 정보
   * @param userPassword 사용자 비밀번호
   * @throws {WalletError} 키 갱신 실패시
   */
  private async refreshWallet(
    wallet: WalletDTO,
    userPassword: string
  ): Promise<void> {
    try {
      const firebaseId = await this.storage.getItem<string>('firebaseId');
      if (!firebaseId) {
        throw new Error('FirebaseId not found');
      }

      // 1. share3 복호화
      const decryptedShare3 = this.decryptShare(
        wallet.encryptedShare3,
        userPassword,
        firebaseId
      );

      // 2. share1과 share3로 개인키 복구
      const privateKey = await this.secrets.combine([
        wallet.share1,
        decryptedShare3,
      ]);

      // 3. 새로운 키 조각들 생성
      const shares = await this.secrets.split(privateKey, 3, 2);
      const [newShare1, newShare2, newShare3] = shares;

      // 4. share2 로컬 저장
      const encryptedShare2 = this.encryptShare(
        newShare2,
        userPassword,
        firebaseId
      );
      await this.storage.setItem('encryptedShare2', encryptedShare2);

      // 5. share1, share3 서버 업데이트
      const encryptedShare3 = this.encryptShare(
        newShare3,
        userPassword,
        firebaseId
      );
      await this.walletClient.updateWalletKey({
        share1: newShare1,
        encryptedShare3,
      });

      // 6. 지갑 인스턴스 업데이트
      this.wallet = new Wallet(privateKey);
    } catch (error) {
      throw new WalletError('Failed to refresh wallet', {
        cause: error as Error,
      });
    }
  }
}
