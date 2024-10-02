package com.altech.core.exceptions;

import org.springframework.http.HttpStatus;

public class JWTException extends GlobalResponseStatusException {

  private static final HttpStatus DEFAULT_STATUS = HttpStatus.UNAUTHORIZED;

  public JWTException(ErrorCode errorCode) {
    super(errorCode, DEFAULT_STATUS);
  }

  public JWTException(String message, ErrorCode errorCode) {
    super(message, errorCode, DEFAULT_STATUS);
  }
}
