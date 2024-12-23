package com.wefunding.core.domain.wallet;

import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface WalletRepository extends ReactiveCrudRepository<Wallet, UUID> {

  Mono<Wallet> findByUserId(UUID userId);

  Mono<Boolean> existsByUserId(UUID userId);
}
