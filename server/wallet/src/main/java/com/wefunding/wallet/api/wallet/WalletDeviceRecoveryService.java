package com.wefunding.wallet.api.wallet;

import com.wefunding.core.domain.wallet.WalletDeviceRecovery;
import com.wefunding.core.domain.wallet.WalletDeviceRecoveryRepository;
import com.wefunding.core.exceptions.BadRequestException;
import com.wefunding.core.exceptions.ErrorCode;
import com.wefunding.core.utils.Encryptor;
import com.wefunding.wallet.api.wallet.dto.DeviceRecoveryResponse;
import com.wefunding.wallet.api.wallet.dto.UpsertDeviceRecoveryRequest;
import com.wefunding.wallet.config.AttributeStorage;
import com.wefunding.wallet.config.EncryptorProperties;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Service
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class WalletDeviceRecoveryService {

  private final WalletDeviceRecoveryRepository repository;

  @Transactional
  public Mono<Void> upsert(ServerWebExchange exchange, UpsertDeviceRecoveryRequest req) {
    validate(req);

    final UUID orgId = AttributeStorage.getOrganization(exchange).getId();
    final UUID userId = AttributeStorage.getUser(exchange).getId();

    final String deviceSecretEnc =
        Encryptor.encrypt(EncryptorProperties.SECRET_KEY, req.deviceSecret());

    return repository
        .findByOrgIdAndUserIdAndDeviceId(orgId, userId, req.deviceId())
        .flatMap(
            existing -> {
              existing.update(req.encryptedShare2Device(), deviceSecretEnc);
              return repository.save(existing).then();
            })
        .switchIfEmpty(
            repository
                .save(
                    WalletDeviceRecovery.create(
                        orgId,
                        userId,
                        req.deviceId(),
                        req.encryptedShare2Device(),
                        deviceSecretEnc))
                .then());
  }

  @Transactional(readOnly = true)
  public Mono<DeviceRecoveryResponse> get(ServerWebExchange exchange, String deviceId) {
    final UUID orgId = AttributeStorage.getOrganization(exchange).getId();
    final UUID userId = AttributeStorage.getUser(exchange).getId();

    Mono<WalletDeviceRecovery> source;
    if (deviceId != null && !deviceId.isBlank()) {
      source = repository.findByOrgIdAndUserIdAndDeviceId(orgId, userId, deviceId.trim());
    } else {
      // latest
      source = repository.findAllByOrgIdAndUserIdOrderByUpdatedAtDesc(orgId, userId).next();
    }

    return source
        .map(
            item ->
                DeviceRecoveryResponse.found(
                    item.getDeviceId(),
                    item.getEncryptedShare2Device(),
                    Encryptor.decrypt(EncryptorProperties.SECRET_KEY, item.getDeviceSecretEnc())))
        .defaultIfEmpty(DeviceRecoveryResponse.notFound());
  }

  private void validate(UpsertDeviceRecoveryRequest req) {
    if (req == null) throw new BadRequestException(ErrorCode.INVALID_PARAMS);

    if (req.deviceId() == null || req.deviceId().isBlank()) {
      throw new BadRequestException("deviceId is required", ErrorCode.INVALID_PARAMS);
    }
    if (req.encryptedShare2Device() == null || req.encryptedShare2Device().isBlank()) {
      throw new BadRequestException("encryptedShare2Device is required", ErrorCode.INVALID_PARAMS);
    }
    if (req.deviceSecret() == null || req.deviceSecret().isBlank()) {
      throw new BadRequestException("deviceSecret is required", ErrorCode.INVALID_PARAMS);
    }
    if (req.deviceId().length() > 128) {
      throw new BadRequestException("deviceId is too long", ErrorCode.INVALID_PARAMS);
    }
  }
}
