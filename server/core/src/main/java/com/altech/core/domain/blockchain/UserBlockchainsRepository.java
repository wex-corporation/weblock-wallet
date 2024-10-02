package com.altech.core.domain.blockchain;

import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UserBlockchainsRepository extends ReactiveCrudRepository<UserBlockchains, UUID> {

  Mono<UserBlockchains> findByUserId(UUID userId);
}
