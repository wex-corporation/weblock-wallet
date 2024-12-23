package com.wefunding.core.domain.jwt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wefunding.core.domain.jwt.payload.AccessTokenPayload;
import com.wefunding.core.utils.Jwk;
import lombok.AllArgsConstructor;
import org.jose4j.jwt.JwtClaims;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class AccessTokenDecoder {

  private final ObjectMapper objectMapper;
  private final Jwk authJwk;

  public AccessTokenPayload decode(String accessToken) throws JsonProcessingException {
    JwtClaims claims = this.authJwk.resolveClaims(accessToken);
    String payloadJson = claims.getRawJson();
    return this.objectMapper.readValue(payloadJson, AccessTokenPayload.class);
  }
}
