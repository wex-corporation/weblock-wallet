package com.wefunding.core.exceptions;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@ToString
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ErrorResponse {

  private int status;
  private String code;
  private String message;
  private String detail;

  public static ErrorResponse of(int status, ErrorCode errorCode, String detail) {
    return new ErrorResponse(status, errorCode.getCode(), errorCode.getMessage(), detail);
  }
}
