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
      "MC4CAQAwBQYDK2VwBCIEIIF55IVEtJGEMF0CA9KgStGUEuhHfvbgzTFo3v9ieWQt";
  // EdDSA-ed25519 PublicKey base64url encoded
  private static final String WEBLOCKWALLET_API_KEY =
      "MCowBQYDK2VwAyEASXmv-39yF5Wx1vX9lPuP7_9qgWVeGXMdAWr-TKalKMw=";
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
                          "https://app.alwallet.io"));
                  return this.organizationRepository.save(organization);
                }))
        .block();
  }
}
