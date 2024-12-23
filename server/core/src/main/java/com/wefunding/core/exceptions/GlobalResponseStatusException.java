package com.wefunding.core.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Getter
public class GlobalResponseStatusException extends ResponseStatusException {

  private final ErrorCode errorCode;
  private final HttpStatus httpStatus;

  public GlobalResponseStatusException(ErrorCode errorCode, HttpStatus httpStatus) {
    super(httpStatus);
    this.errorCode = errorCode;
    this.httpStatus = httpStatus;
  }

  public GlobalResponseStatusException(String message, ErrorCode errorCode, HttpStatus httpStatus) {
    super(httpStatus, message);
    this.errorCode = errorCode;
    this.httpStatus = httpStatus;
  }

  public GlobalResponseStatusException(
      String message, ErrorCode errorCode, Throwable cause, HttpStatus httpStatus) {
    super(httpStatus, message, cause);
    this.errorCode = errorCode;
    this.httpStatus = httpStatus;
  }
}
