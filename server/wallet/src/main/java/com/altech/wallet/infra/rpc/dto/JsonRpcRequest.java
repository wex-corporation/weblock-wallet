package com.altech.wallet.infra.rpc.dto;

import com.altech.core.domain.rpc.RpcMethod;
import java.util.List;
import java.util.Random;

public record JsonRpcRequest(String jsonrpc, Object id, String method, List<Object> params) {

  private static final Random RANDOM = new Random();
  private static final long MAX_ID = 9999999L;

  private JsonRpcRequest(String method, List<Object> params) {
    this("2.0", generateRandomId(), method, params);
  }

  public static JsonRpcRequest request(RpcMethod method, List<Object> params) {
    return new JsonRpcRequest(method.getValue(), params);
  }

  private static long generateRandomId() {
    return 1 + RANDOM.nextLong(MAX_ID);
  }
}
