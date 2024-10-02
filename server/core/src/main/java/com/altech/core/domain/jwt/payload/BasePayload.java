package com.altech.core.domain.jwt.payload;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class BasePayload {

  private String iss;
  private String sub;
  private String aud;
  private Long exp;
  private Long nbf;
  private Long iat;
  private String jti;
}
