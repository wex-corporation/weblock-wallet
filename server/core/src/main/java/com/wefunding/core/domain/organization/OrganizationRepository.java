package com.wefunding.core.domain.organization;

import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface OrganizationRepository extends ReactiveCrudRepository<Organization, UUID> {

  Mono<Organization> findByApiKey(String apiKey);
}
