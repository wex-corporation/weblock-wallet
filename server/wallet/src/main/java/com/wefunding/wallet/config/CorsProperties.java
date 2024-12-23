package com.wefunding.wallet.config;

import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = CorsProperties.CORS_PROPERTIES_PREFIX)
public class CorsProperties {
  public static final String CORS_PROPERTIES_PREFIX = "app.cors";

  private List<String> allowedOrigins;
}
