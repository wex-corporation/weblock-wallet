import { Client } from '../utils/httpClient'
import { RpcResponse, TransactionReceipt } from '@weblock-wallet/types'

export class RpcClient {
  private readonly baseUrl = '/v1/rpcs'
  public readonly client: Client

  constructor(client: Client) {
    this.client = client
  }

  async getBlockNumber(chainId: number): Promise<RpcResponse<number>> {
    const response = await this.client.post<RpcResponse<number>>(
      `${this.baseUrl}`,
      {
        chainId,
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 1000000) + Date.now(),
        method: 'eth_blockNumber'
      }
    )
    return response!
  }

  async getTransactionCount(
    chainId: number,
    address: string
  ): Promise<RpcResponse<number>> {
    const response = await this.client.post<RpcResponse<number>>(
      `${this.baseUrl}`,
      {
        chainId,
        jsonrpc: '2.0',
        id: this.getRandomId(),
        method: 'eth_getTransactionCount',
        params: [address, 'latest']
      }
    )
    return response!
  }

  async getBalance(
    chainId: number,
    address: string
  ): Promise<RpcResponse<string>> {
    const response = await this.client.post<RpcResponse<string>>(
      `${this.baseUrl}`,
      {
        chainId,
        jsonrpc: '2.0',
        id: this.getRandomId(),
        method: 'eth_getBalance',
        params: [address, 'latest']
      }
    )
    return response!
  }

  async getGasPrice(chainId: number): Promise<RpcResponse<string>> {
    const response = await this.client.post<RpcResponse<string>>(
      `${this.baseUrl}`,
      {
        chainId,
        jsonrpc: '2.0',
        id: this.getRandomId(),
        method: 'eth_gasPrice'
      }
    )
    return response!
  }

  async estimateGas(chainId: number): Promise<RpcResponse<string>> {
    const response = await this.client.post<RpcResponse<string>>(
      `${this.baseUrl}`,
      {
        chainId,
        jsonrpc: '2.0',
        id: this.getRandomId(),
        method: 'eth_estimateGas'
      }
    )
    return response!
  }

  async sendRawTransaction(
    chainId: number,
    signedTx: string
  ): Promise<RpcResponse<string>> {
    const response = await this.client.post<RpcResponse<TransactionReceipt>>(
      `${this.baseUrl}`,
      {
        chainId,
        jsonrpc: '2.0',
        id: this.getRandomId(),
        method: 'eth_sendRawTransaction',
        params: [signedTx]
      }
    )
    return response!
  }

  async getTransactionReceipt(
    chainId: number,
    hash: string
  ): Promise<RpcResponse<TransactionReceipt>> {
    const response = await this.client.post<RpcResponse<TransactionReceipt>>(
      `${this.baseUrl}`,
      {
        chainId,
        jsonrpc: '2.0',
        id: this.getRandomId(),
        method: 'eth_getTransactionReceipt',
        params: [hash]
      }
    )
    return response!
  }

  private getRandomId(): number {
    return Math.floor(Math.random() * 1000000) + Date.now()
  }
}
