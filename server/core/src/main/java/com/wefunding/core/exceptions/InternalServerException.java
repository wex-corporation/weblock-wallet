package com.wefunding.core.exceptions;

import org.springframework.http.HttpStatus;

public class InternalServerException extends GlobalResponseStatusException {

  private static final HttpStatus DEFAULT_STATUS = HttpStatus.INTERNAL_SERVER_ERROR;

  public InternalServerException(String message) {
    super(message, ErrorCode.INTERNAL_SERVER, DEFAULT_STATUS);
  }

  public InternalServerException(ErrorCode errorCode) {
    super(errorCode, DEFAULT_STATUS);
  }

  public InternalServerException(String message, ErrorCode errorCode) {
    super(message, errorCode, DEFAULT_STATUS);
  }
}
