package com.wefunding.core.domain.coin;

import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface CoinRepository extends ReactiveCrudRepository<Coin, UUID> {

  Flux<Coin> findAllByIsDefaultIsTrue();

  Flux<Coin> findAllByIdIsIn(List<UUID> coinIds);

  Mono<Coin> findByBlockchainIdAndContractAddress(UUID blockchainId, String contractAddress);
}
