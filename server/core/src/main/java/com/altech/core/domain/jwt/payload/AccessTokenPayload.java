package com.altech.core.domain.jwt.payload;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AccessTokenPayload extends BasePayload {

  private String userId;
  private String firebaseId;
  private String userEmail;
}
