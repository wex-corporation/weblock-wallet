package com.altech.wallet.config.filter.url;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public class FilterErrorResponse {

  private int status;
  private String message;

  public static FilterErrorResponse of(int status, String message) {
    return new FilterErrorResponse(status, message);
  }
}
