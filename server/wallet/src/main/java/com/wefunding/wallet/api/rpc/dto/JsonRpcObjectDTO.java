package com.wefunding.wallet.api.rpc.dto;

import com.wefunding.core.domain.rpc.JsonRpcObject;
import org.web3j.protocol.core.methods.response.EthSendRawTransaction;

public record JsonRpcObjectDTO(Object id, String jsonrpc, Object result, ErrorDTO error) {

  public static JsonRpcObjectDTO rpc(JsonRpcObject jsonRpcObject) {
    return jsonRpcObject.hasError()
        ? new JsonRpcObjectDTO(
            jsonRpcObject.getId(),
            jsonRpcObject.getJsonrpc(),
            null,
            ErrorDTO.from(jsonRpcObject.getError()))
        : new JsonRpcObjectDTO(
            jsonRpcObject.getId(), jsonRpcObject.getJsonrpc(), jsonRpcObject.getResult(), null);
  }

  public static JsonRpcObjectDTO transaction(EthSendRawTransaction transaction) {
    return transaction.hasError()
        ? new JsonRpcObjectDTO(
            transaction.getId(),
            transaction.getJsonrpc(),
            null,
            ErrorDTO.from(transaction.getError()))
        : new JsonRpcObjectDTO(
            transaction.getId(), transaction.getJsonrpc(), transaction.getResult(), null);
  }
}
