package com.wefunding.wallet.config.init;

import com.wefunding.core.domain.organization.Organization;
import com.wefunding.core.domain.organization.OrganizationRepository;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import reactor.core.publisher.Mono;

@Configuration
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Profile({"!prod"})
@Order(1)
public class OrganizationInitializer implements CommandLineRunner {

  // EdDSA-ed25519 PrivateKey base64url encoded
  private static final String WEBLOCKWALLET_SECRET_KEY =
      "MC4CAQAwBQYDK2VwBCIEIECoDobSjKJOiQvLVUdsjXIv7LdT9bh0S011y_Tp2Rkj";
  // EdDSA-ed25519 PublicKey base64url encoded
  private static final String WEBLOCKWALLET_API_KEY =
      "MCowBQYDK2VwAyEAmzzEyhFkjZxi8mJK0lZQD_dSN71HjBEA9nWXA-rh79s";
  private final OrganizationRepository organizationRepository;

  @Override
  public void run(String... args) {
    this.organizationRepository
        .findByApiKey(WEBLOCKWALLET_API_KEY)
        .switchIfEmpty(
            Mono.defer(
                () -> {
                  Organization organization =
                      Organization.create("WeBlockWallet", WEBLOCKWALLET_API_KEY);
                  organization.setAllowedHosts(
                      List.of(
                          "http://localhost:3000",
                          "http://localhost:3333",
                          "https://api-wallet.weblock.land"));
                  return this.organizationRepository.save(organization);
                }))
        .block();
  }
}
