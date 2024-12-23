package com.wefunding.core.exceptions;

import org.springframework.http.HttpStatus;

public class AuthorizationException extends GlobalResponseStatusException {

  private static final HttpStatus DEFAULT_STATUS = HttpStatus.UNAUTHORIZED;

  public AuthorizationException(ErrorCode errorCode) {
    super(errorCode, DEFAULT_STATUS);
  }

  public AuthorizationException(String message, ErrorCode errorCode) {
    super(message, errorCode, DEFAULT_STATUS);
  }
}
