package com.altech.wallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;

@SpringBootApplication(scanBasePackages = {"com.altech.core", "com.altech.wallet"})
@EntityScan(basePackages = {"com.altech.core", "com.altech.wallet"})
@EnableR2dbcRepositories(basePackages = {"com.altech.core", "com.altech.wallet"})
@EnableR2dbcAuditing
@EnableConfigurationProperties
@EnableCaching
public class WalletApplication {

  public static void main(String[] args) {
    SpringApplication.run(WalletApplication.class, args);
  }
}
