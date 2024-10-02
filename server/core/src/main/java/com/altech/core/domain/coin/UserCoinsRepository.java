package com.altech.core.domain.coin;

import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface UserCoinsRepository extends ReactiveCrudRepository<UserCoins, UUID> {

  Mono<UserCoins> findByUserId(UUID userId);
}
