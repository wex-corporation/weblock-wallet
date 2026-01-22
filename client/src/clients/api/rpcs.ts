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

    const res: any = await this.client.post(this.baseUrl, rpcRequest, {
      needsAccessToken: true,
    })

    // Some backends return JSON-stringified objects in `result` (e.g., eth_getTransactionReceipt).
    // Normalize here so higher layers can rely on object fields like `status`, `blockNumber`, etc.
    if (res && typeof res.result === 'string') {
      const t = res.result.trim()
      if (
        (t.startsWith('{') && t.endsWith('}')) ||
        (t.startsWith('[') && t.endsWith(']'))
      ) {
        try {
          res.result = JSON.parse(t)
        } catch {
          // ignore parse errors; keep original string
        }
      }
    }

    return res
  }
}
