package com.wefunding.core.domain.rpc;

import java.util.Arrays;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public enum RpcMethod {
  ETH_GET_BALANCE("eth_getBalance"),
  ETH_GET_BLOCK_BY_NUMBER("eth_getBlockByNumber"),
  ETH_GET_BLOCK_BY_HASH("eth_getBlockByHash"),
  ETH_GET_TRANSACTION_COUNT("eth_getTransactionCount"),
  ETH_GET_TRANSACTION_BY_HASH("eth_getTransactionByHash"),
  ETH_GET_TRANSACTION_RECEIPT("eth_getTransactionReceipt"),
  ETH_GET_LOGS("eth_getLogs"),
  ETH_CALL("eth_call"),
  ETH_ESTIMATE_GAS("eth_estimateGas"),
  ETH_SEND_RAW_TRANSACTION("eth_sendRawTransaction"),
  ETH_CHAIN_ID("eth_chainId"),
  ETH_GAS_PRICE("eth_gasPrice"),
  ETH_BLOCK_NUMBER("eth_blockNumber"),
  NET_VERSION("net_version");

  private final String value;

  public static RpcMethod from(String method) {
    return Arrays.stream(RpcMethod.values())
        .filter(rpcMethod -> rpcMethod.getValue().equals(method))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("Unsupported rpc method: " + method));
  }
}
