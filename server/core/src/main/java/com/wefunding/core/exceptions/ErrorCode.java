package com.wefunding.core.exceptions;

import java.util.Arrays;

public enum ErrorCode {
  UNKNOWN_ERROR("C9999", "Unknown error"),
  INVALID_PARAMS("C8888", "Invalid parameters"),
  UNCATEGORIZED_ERROR("C0000", "Uncategorized error, see message for more detail"),
  USER_NOT_FOUND("C0001", "User not found"),
  FIREBASE_VERIFICATION_ERROR("C0002", "Failed to verify Firebase id token"),
  FIREBASE_ID_MISMATCH("C0003", "Firebase id mismatch with decoded id token value"),
  FAILED_GETTING_RPC_RESPONSE("C0004", "Failed to get rpc response"),
  UNSUPPORTED_RPC_METHOD("C0005", "Unsupported rpc method"),
  ORGANIZATION_NOT_FOUND("C0006", "Organization not found"),
  INVALID_SIGNATURE("C0007", "Invalid signature"),
  TOKEN_EXPIRED("C0008", "JWT Expired"),
  AUTHORIZATION_HEADER_NOT_FOUND("C0009", "Authorization header not found"),
  NOT_ALLOWED_HOST("C0010", "Host not allowed. Please register host first"),
  INVALID_ACCESS_TOKEN("C0011", "Invalid access token"),
  NOT_REGISTERED_BLOCKCHAIN("C0012", "Blockchain not registered"),
  INTERNAL_SERVER("C0500", "Internal server error");

  private final String code;
  private final String message;

  ErrorCode(String code, String message) {
    this.code = code;
    this.message = message;
  }

  ErrorCode(String code) {
    this.code = code;
    this.message = "";
  }

  public String getCode() {
    return this.code;
  }

  public String getMessage() {
    return this.message;
  }

  public static ErrorCode findByValue(String value) {
    return Arrays.stream(ErrorCode.values())
        .filter(errorCode -> errorCode.getCode().equals(value))
        .findFirst()
        .orElse(ErrorCode.INTERNAL_SERVER);
  }
}
