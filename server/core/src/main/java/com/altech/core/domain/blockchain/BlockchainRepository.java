package com.altech.core.domain.blockchain;

import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface BlockchainRepository extends ReactiveCrudRepository<Blockchain, UUID> {
  Flux<Blockchain> findAllByIsDefaultIsTrue();

  Flux<Blockchain> findAllByIdIsIn(List<UUID> blockchainIds);
}
