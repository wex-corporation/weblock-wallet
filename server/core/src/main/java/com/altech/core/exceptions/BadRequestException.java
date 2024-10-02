package com.altech.core.exceptions;

import org.springframework.http.HttpStatus;

public class BadRequestException extends GlobalResponseStatusException {

  private static final HttpStatus DEFAULT_STATUS = HttpStatus.BAD_REQUEST;

  public BadRequestException(ErrorCode errorCode) {
    super(errorCode, DEFAULT_STATUS);
  }

  public BadRequestException(String message, ErrorCode errorCode) {
    super(message, errorCode, DEFAULT_STATUS);
  }

  public BadRequestException(String message, Throwable throwable) {
    super(message, ErrorCode.UNCATEGORIZED_ERROR, throwable, DEFAULT_STATUS);
  }

  public BadRequestException(String message, ErrorCode errorCode, HttpStatus status) {
    super(message, errorCode, status);
  }
}
