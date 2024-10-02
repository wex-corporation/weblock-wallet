package com.altech.wallet.api.rpc.dto;

import com.altech.core.domain.rpc.JsonRpcObject;
import org.web3j.protocol.core.Response;

public record ErrorDTO(int code, String message, String data) {
  public static ErrorDTO from(Response.Error error) {
    return new ErrorDTO(error.getCode(), error.getMessage(), error.getData());
  }

  public static ErrorDTO from(JsonRpcObject.Error error) {
    return new ErrorDTO(error.getCode(), error.getMessage(), error.getData());
  }
}
