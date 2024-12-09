import { BaseApiClient } from './base';
import { CreateWalletRequest, WalletDTO } from '../types/wallet';

export class WalletApiClient extends BaseApiClient {
  private readonly basePath = '/v1/wallets';

  /**
   * 지갑 생성
   * @throws {HttpError} 401 - 인증되지 않은 요청
   * @throws {HttpError} 400 - 잘못된 요청
   */
  async createWallet(request: CreateWalletRequest): Promise<WalletDTO> {
    return await this.post<WalletDTO>(this.basePath, request);
  }

  /**
   * 지갑 조회
   * @throws {HttpError} 401 - 인증되지 않은 요청
   * @throws {HttpError} 404 - 지갑을 찾을 수 없음
   */
  async getWallet(): Promise<WalletDTO> {
    return await this.get<WalletDTO>(this.basePath);
  }

  /**
   * 지갑 키 업데이트
   * @throws {HttpError} 401 - 인증되지 않은 요청
   * @throws {HttpError} 404 - 지갑을 찾을 수 없음
   */
  async updateWalletKey(request: {
    share1: string;
    encryptedShare3: string;
  }): Promise<void> {
    await this.post(`${this.basePath}/keys`, request);
  }
}
