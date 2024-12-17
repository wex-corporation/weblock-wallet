import { HttpClient } from '../http'
import { SendRpcRequest, JsonRpcResponse } from '../types'

export class RpcClient {
  private readonly baseUrl = '/v1/rpcs'

  constructor(private readonly client: HttpClient) {}

  async sendRpc<T = any>(request: SendRpcRequest): Promise<JsonRpcResponse<T>> {
    return this.client.post(this.baseUrl, request)
  }
}
