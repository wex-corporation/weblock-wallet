package com.wefunding.core.domain.jwt;

import com.wefunding.core.utils.Jwk;
import java.util.HashMap;
import java.util.Map;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class AccessTokenGenerator {

  private final Jwk authJwk;

  public String create(String userId, String firebaseId, String email) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", userId);
    claims.put("firebaseId", firebaseId);
    claims.put("userEmail", email);
    return this.authJwk.createJWT(claims);
  }
}
