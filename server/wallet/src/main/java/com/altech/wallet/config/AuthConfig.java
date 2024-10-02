package com.altech.wallet.config;

import com.altech.core.utils.Jwk;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuthConfig {

  @Bean("authJwk")
  public Jwk authJwk(AuthProperties authProperties) {
    return Jwk.of(authProperties.getSecretKey(), authProperties.getPublicKey());
  }
}
