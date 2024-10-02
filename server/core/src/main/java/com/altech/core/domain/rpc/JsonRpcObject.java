package com.altech.core.domain.rpc;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JsonRpcObject {

  private JsonNode id;
  private String jsonrpc;
  private Object result;
  private Error error;

  @Getter
  @Setter
  @AllArgsConstructor(access = AccessLevel.PRIVATE)
  public static class Error {

    private final int code;
    private final String message;
    private final String data;
  }

  public boolean hasError() {
    return this.error != null;
  }
}
