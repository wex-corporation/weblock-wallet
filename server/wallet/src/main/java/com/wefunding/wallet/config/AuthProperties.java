package com.wefunding.wallet.config;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@NoArgsConstructor
@Configuration
@ConfigurationProperties(prefix = AuthProperties.AUTH_PROPERTIES_PREFIX)
public class AuthProperties {
  public static final String AUTH_PROPERTIES_PREFIX = "app.auth";

  private String secretKey;
  private String publicKey;
}
