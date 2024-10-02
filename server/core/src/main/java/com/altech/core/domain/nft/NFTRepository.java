package com.altech.core.domain.nft;

import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

public interface NFTRepository extends ReactiveCrudRepository<NFT, UUID> {

  Mono<NFT> findByBlockchainIdAndContractAddress(UUID blockchainId, String contractAddress);
}
