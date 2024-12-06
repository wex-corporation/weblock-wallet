import { BaseApiClient } from './base';
import {
  WalletDTO,
  CreateWalletRequest,
  GetWalletRequest,
  WalletBalanceDTO,
} from '../types/wallet';

export class WalletApiClient extends BaseApiClient {
  private readonly basePath = '/v1/wallets';

  /**
   * 지갑 생성
   * @throws {HttpError} 401 - 인증되지 않은 요청
   * @throws {HttpError} 400 - 잘못된 요청
   */
  async createWallet(request: CreateWalletRequest): Promise<WalletDTO> {
    return await this.post<WalletDTO>(`${this.basePath}/create`, request);
  }

  /**
   * 지갑 조회
   * @throws {HttpError} 401 - 인증되지 않은 요청
   * @throws {HttpError} 404 - 지갑을 찾을 수 없음
   */
  async getWallet(request: GetWalletRequest): Promise<WalletDTO> {
    return await this.get<WalletDTO>(`${this.basePath}`, {
      params: { blockchainId: request.blockchainId },
    });
  }

  /**
   * 지갑 잔액 조회
   * @throws {HttpError} 401 - 인증되지 않은 요청
   * @throws {HttpError} 404 - 지갑을 찾을 수 없음
   */
  async getBalance(blockchainId: string): Promise<WalletBalanceDTO> {
    return await this.get<WalletBalanceDTO>(`${this.basePath}/balance`, {
      params: { blockchainId },
    });
  }
}
