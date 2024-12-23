package com.wefunding.wallet.infra.rpc;

import com.wefunding.core.domain.rpc.JsonRpcObject;
import com.wefunding.core.domain.rpc.RpcMethod;
import com.wefunding.wallet.api.rpc.RpcClient;
import com.wefunding.wallet.infra.rpc.dto.JsonRpcRequest;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.web3j.protocol.core.methods.response.EthSendRawTransaction;
import reactor.core.publisher.Mono;

@Component
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class EvmRpcClient implements RpcClient {

  private final WebClient.Builder webClientBuilder;

  @Override
  public Mono<JsonRpcObject> sendRpc(
      String nodeUrl, String jsonrpc, Object id, RpcMethod method, List<Object> params) {
    WebClient client = this.webClientBuilder.baseUrl(nodeUrl).build();
    JsonRpcRequest request = new JsonRpcRequest(jsonrpc, id, method.getValue(), params);
    return client
        .post()
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(JsonRpcObject.class)
        .doOnError(Throwable::getStackTrace);
  }

  @Override
  public Mono<EthSendRawTransaction> sendRawTransaction(String nodeUrl, String serializedTx) {
    WebClient client = this.webClientBuilder.baseUrl(nodeUrl).build();

    JsonRpcRequest request =
        JsonRpcRequest.request(RpcMethod.ETH_SEND_RAW_TRANSACTION, List.of(serializedTx));

    return client
        .post()
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(EthSendRawTransaction.class)
        .doOnError(Throwable::getStackTrace);
  }
}
