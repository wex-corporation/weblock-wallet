import { BaseApiClient } from './base';
import { SignInRequest, SignInResponse } from '../types/auth';
import { BlockchainDTO, RegisterBlockchainRequest } from '../types/blockchain';
import { CoinDTO, RegisterTokenRequest } from '../types/coin';
import { UserDTO } from '../types/user';

export class UserApiClient extends BaseApiClient {
  private readonly basePath = '/v1/users';

  /**
   * 사용자 로그인
   * @throws {HttpError} 401 - 인증 실패
   */
  async signIn(request: SignInRequest): Promise<SignInResponse> {
    const response = await this.post<SignInResponse>(
      `${this.basePath}/sign-in`,
      request,
      { needsAccessToken: false }
    );
    await this.setToken(response.token);
    return response;
  }

  /**
   * 현재 사용자 정보 조회
   * @throws {HttpError} 401 - 인증되지 않은 요청
   * @throws {HttpError} 404 - 사용자를 찾을 수 없음
   */
  async getUser(): Promise<UserDTO> {
    return await this.get<UserDTO>(this.basePath);
  }

  /**
   * 블록체인 등록
   * @throws {HttpError} 401 - 인증되지 않은 요청
   * @throws {HttpError} 400 - 잘못된 요청
   */
  async registerBlockchain(request: RegisterBlockchainRequest): Promise<void> {
    await this.post(`${this.basePath}/register-blockchain`, request);
  }

  /**
   * 등록된 블록체인 목록 조회
   * @throws {HttpError} 401 - 인증되지 않은 요청
   */
  async getRegisteredBlockchains(): Promise<BlockchainDTO[]> {
    return await this.get<BlockchainDTO[]>(`${this.basePath}/blockchains`);
  }

  /**
   * 토큰 등록
   * @throws {HttpError} 401 - 인증되지 않은 요청
   * @throws {HttpError} 400 - 잘못된 요청
   */
  async registerToken(request: RegisterTokenRequest): Promise<CoinDTO> {
    return await this.post<CoinDTO>(`${this.basePath}/register-token`, request);
  }

  /**
   * 등록된 코인 목록 조회
   * @throws {HttpError} 401 - 인증되지 않은 요청
   */
  async getRegisteredCoins(blockchainId: string): Promise<CoinDTO[]> {
    return await this.get<CoinDTO[]>(`${this.basePath}/coins`, {
      params: { blockchainId },
    });
  }
}
