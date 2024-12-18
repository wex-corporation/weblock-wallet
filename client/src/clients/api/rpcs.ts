import { HttpClient } from '../http'
import { RpcMethod, SendRpcRequest, JsonRpcResponse } from '../types'

export class RpcClient {
  private readonly baseUrl = '/v1/rpcs'

  constructor(private readonly client: HttpClient) {}

  async sendRpc<T = any>(request: {
    chainId: number
    method: RpcMethod
    params: any[]
  }): Promise<JsonRpcResponse<T>> {
    const rpcRequest: SendRpcRequest = {
      chainId: request.chainId,
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1000000) + Date.now(),
      method: request.method,
      params: request.params,
    }

    return this.client.post(this.baseUrl, rpcRequest, {
      needsAccessToken: true,
    })
  }
}
