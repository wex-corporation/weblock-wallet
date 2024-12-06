export enum RpcMethod {
  GetBalance = 'eth_getBalance',
  GetBlockByNumber = 'eth_getBlockByNumber',
  GetTransactionCount = 'eth_getTransactionCount',
  GetTransactionReceipt = 'eth_getTransactionReceipt',
  SendRawTransaction = 'eth_sendRawTransaction',
  GasPrice = 'eth_gasPrice',
  BlockNumber = 'eth_blockNumber',
}

export interface RpcRequest {
  chainId: number;
  jsonrpc: '2.0';
  id: number | string;
  method: RpcMethod | string;
  params: unknown[];
}

export interface RpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number | string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}
