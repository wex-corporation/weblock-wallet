package com.wefunding.core.domain.coin;

import java.util.List;
import java.util.UUID;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface CoinRepository extends ReactiveCrudRepository<Coin, UUID> {

  Flux<Coin> findAllByIsDefaultIsTrue();

  Flux<Coin> findAllByIdIsIn(List<UUID> coinIds);

  Mono<Coin> findByBlockchainIdAndContractAddress(UUID blockchainId, String contractAddress);

  @Query(
      """
      INSERT INTO coins
        (name, symbol, blockchain_id, contract_address, is_default, decimals, created_at, updated_at)
      VALUES
        (:name, :symbol, :blockchainId, :contractAddress, FALSE, :decimals, now(), now())
      ON CONFLICT (blockchain_id, contract_address)
      DO UPDATE SET
        name = EXCLUDED.name,
        symbol = EXCLUDED.symbol,
        decimals = EXCLUDED.decimals,
        updated_at = now()
      RETURNING *
      """)
  Mono<Coin> upsertToken(
      String name, String symbol, UUID blockchainId, String contractAddress, Integer decimals);
}
