package com.altech.wallet.api.rpc;

import com.altech.core.domain.rpc.JsonRpcObject;
import com.altech.core.domain.rpc.RpcMethod;
import java.util.List;
import org.web3j.protocol.core.methods.response.EthSendRawTransaction;
import reactor.core.publisher.Mono;

public interface RpcClient {

  Mono<JsonRpcObject> sendRpc(
      String nodeUrl, String jsonrpc, Object id, RpcMethod method, List<Object> params);

  Mono<EthSendRawTransaction> sendRawTransaction(String nodeUrl, String serializedTx);
}
