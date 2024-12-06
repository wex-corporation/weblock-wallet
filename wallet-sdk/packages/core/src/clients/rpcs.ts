import { BaseApiClient } from './base';
import { RpcMethod, RpcRequest, RpcResponse } from '../types/rpc';
import { TransactionReceipt } from '../types/transaction';

export class RpcApiClient extends BaseApiClient {
  private readonly basePath = '/v1/rpcs';

  /**
   * RPC 요청 생성 유틸리티
   */
  private createRpcRequest(
    chainId: number,
    method: RpcMethod,
    params: unknown[] = []
  ): RpcRequest {
    return {
      chainId,
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    };
  }

  /**
   * RPC 요청 전송 유틸리티
   */
  private async sendRpcRequest<T>(
    request: RpcRequest
  ): Promise<RpcResponse<T>> {
    return await this.post<RpcResponse<T>>(this.basePath, request);
  }

  /**
   * 블록 번호 조회
   * @throws {HttpError} 401 - 인증되지 않은 요청
   */
  async getBlockNumber(chainId: number): Promise<RpcResponse<string>> {
    const request = this.createRpcRequest(chainId, RpcMethod.BlockNumber);
    return await this.sendRpcRequest(request);
  }

  /**
   * 계정 잔액 조회
   * @throws {HttpError} 401 - 인증되지 않은 요청
   */
  async getBalance(
    chainId: number,
    address: string
  ): Promise<RpcResponse<string>> {
    const request = this.createRpcRequest(chainId, RpcMethod.GetBalance, [
      address,
      'latest',
    ]);
    return await this.sendRpcRequest(request);
  }

  /**
   * 계정 논스(nonce) 조회
   * @throws {HttpError} 401 - 인증되지 않은 요청
   */
  async getTransactionCount(
    chainId: number,
    address: string
  ): Promise<RpcResponse<string>> {
    const request = this.createRpcRequest(
      chainId,
      RpcMethod.GetTransactionCount,
      [address, 'latest']
    );
    return await this.sendRpcRequest(request);
  }

  /**
   * 서명된 트랜잭션 전송
   * @throws {HttpError} 401 - 인증되지 않은 요청
   */
  async sendRawTransaction(
    chainId: number,
    signedTx: string
  ): Promise<RpcResponse<string>> {
    const request = this.createRpcRequest(
      chainId,
      RpcMethod.SendRawTransaction,
      [signedTx]
    );
    return await this.sendRpcRequest(request);
  }

  /**
   * 트랜잭션 영수증 조회
   * @throws {HttpError} 401 - 인증되지 않은 요청
   */
  async getTransactionReceipt(
    chainId: number,
    hash: string
  ): Promise<RpcResponse<TransactionReceipt>> {
    const request = this.createRpcRequest(
      chainId,
      RpcMethod.GetTransactionReceipt,
      [hash]
    );
    return await this.sendRpcRequest(request);
  }
}
