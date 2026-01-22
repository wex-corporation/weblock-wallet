package com.wefunding.core.domain.wallet;

import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface WalletDeviceRecoveryRepository
    extends ReactiveCrudRepository<WalletDeviceRecovery, UUID> {

  Mono<WalletDeviceRecovery> findByOrgIdAndUserIdAndDeviceId(
      UUID orgId, UUID userId, String deviceId);

  Flux<WalletDeviceRecovery> findAllByOrgIdAndUserIdOrderByUpdatedAtDesc(UUID orgId, UUID userId);
}
