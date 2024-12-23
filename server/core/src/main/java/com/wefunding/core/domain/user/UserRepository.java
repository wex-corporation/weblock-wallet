package com.wefunding.core.domain.user;

import com.wefunding.core.domain.blockchain.BlockchainRepository;
import com.wefunding.core.domain.blockchain.UserBlockchainsRepository;
import com.wefunding.core.domain.wallet.WalletRepository;
import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UserRepository extends ReactiveCrudRepository<User, UUID> {

  Mono<User> findByOrgIdAndFirebaseId(UUID orgId, String firebaseId);

  default Mono<User> findWithRelationsByOrgIdAndFirebaseId(
      BlockchainRepository blockchainRepository,
      UserBlockchainsRepository userBlockchainsRepository,
      WalletRepository walletRepository,
      UUID orgId,
      String firebaseId) {
    return this.findByOrgIdAndFirebaseId(orgId, firebaseId)
        .flatMap(
            user ->
                Mono.zip(
                        userBlockchainsRepository.findByUserId(user.getId()),
                        walletRepository.findByUserId(user.getId()))
                    .map(
                        tuple -> {
                          User userWithBlockchains =
                              user.withBlockchains(
                                  tuple.getT1().getBlockchainIds().stream()
                                      .map(
                                          blockchainId ->
                                              blockchainRepository.findById(blockchainId).block())
                                      .toList());
                          return userWithBlockchains.withWallet(tuple.getT2());
                        }));
  }

  default Mono<User> findWithBlockchainsByOrgIdAndFirebaseId(
      BlockchainRepository blockchainRepository,
      UserBlockchainsRepository userBlockchainsRepository,
      UUID orgId,
      String firebaseId) {
    return this.findByOrgIdAndFirebaseId(orgId, firebaseId)
        .flatMap(
            user ->
                userBlockchainsRepository
                    .findByUserId(user.getId())
                    .flatMap(
                        userBlockchains ->
                            Flux.fromIterable(userBlockchains.getBlockchainIds())
                                .flatMap(blockchainRepository::findById)
                                .collectList()
                                .map(user::withBlockchains)));
  }

  default Mono<User> findWithBlockchainsById(
      BlockchainRepository blockchainRepository,
      UserBlockchainsRepository userBlockchainsRepository,
      UUID id) {
    return this.findById(id)
        .flatMap(
            user ->
                userBlockchainsRepository
                    .findByUserId(user.getId())
                    .flatMap(
                        userBlockchain ->
                            Flux.fromIterable(userBlockchain.getBlockchainIds())
                                .flatMap(blockchainRepository::findById)
                                .collectList()
                                .map(user::withBlockchains)));
  }
}
