package com.wefunding.wallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;

@SpringBootApplication(scanBasePackages = {"com.wefunding.core", "com.wefunding.wallet"})
@EntityScan(basePackages = {"com.wefunding.core", "com.wefunding.wallet"})
@EnableR2dbcRepositories(basePackages = {"com.wefunding.core", "com.wefunding.wallet"})
@EnableR2dbcAuditing
@EnableConfigurationProperties
@EnableCaching
public class WalletApplication {

  public static void main(String[] args) {
    SpringApplication.run(WalletApplication.class, args);
  }
}
