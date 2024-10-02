package com.altech.wallet.config;

import javax.annotation.PostConstruct;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@NoArgsConstructor
@Configuration
@ConfigurationProperties(prefix = EncryptorProperties.ENCRYPTOR_PROPERTIES_PREFIX)
public class EncryptorProperties {

  public static final String ENCRYPTOR_PROPERTIES_PREFIX = "app.encryptor";
  public static String SECRET_KEY;
  private String secretKey;

  @PostConstruct
  public void update() {
    SECRET_KEY = this.secretKey;
  }
}
