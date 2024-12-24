package com.wefunding.wallet.api.wallet;

import com.wefunding.core.domain.wallet.Wallet;
import com.wefunding.core.domain.wallet.WalletRepository;
import com.wefunding.core.utils.Encryptor;
import com.wefunding.wallet.api.wallet.dto.CreateWalletRequest;
import com.wefunding.wallet.api.wallet.dto.UpdateKeyRequest;
import com.wefunding.wallet.api.wallet.dto.WalletDTO;
import com.wefunding.wallet.config.AttributeStorage;
import com.wefunding.wallet.config.EncryptorProperties;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class WalletService {

  private final WalletRepository walletRepository;

  @Transactional
  public Mono<Void> createWallet(ServerWebExchange exchange, CreateWalletRequest request) {
    Wallet wallet =
        Wallet.create(
            AttributeStorage.getUser(exchange).getId(),
            request.address(),
            request.publicKey(),
            Encryptor.encrypt(EncryptorProperties.SECRET_KEY, request.share1()),
            request.encryptedShare3());
    log.info(">>>>>>>>>>>>>>>> createWallet: {}", AttributeStorage.getUser(exchange).getId());
    log.info(">>>>>>>>>>>>>>>> createWallet: {}", request.publicKey());
    return this.walletRepository
        .save(
            Wallet.create(
                AttributeStorage.getUser(exchange).getId(),
                request.address(),
                request.publicKey(),
                Encryptor.encrypt(EncryptorProperties.SECRET_KEY, request.share1()),
                request.encryptedShare3()))
        .then();
  }

  @Transactional
  public Mono<Void> updateWalletKey(ServerWebExchange exchange, UpdateKeyRequest request) {
    return this.walletRepository
        .findByUserId(AttributeStorage.getUser(exchange).getId())
        .doOnError(Throwable::printStackTrace)
        .switchIfEmpty(Mono.error(new RuntimeException("Wallet not found.")))
        .flatMap(
            wallet -> {
              wallet.updateWalletKey(
                  Encryptor.encrypt(EncryptorProperties.SECRET_KEY, request.share1()),
                  request.encryptedShare3());
              return this.walletRepository.save(wallet);
            })
        .doOnError(Throwable::printStackTrace)
        .then();
  }

  @Transactional(readOnly = true)
  public Mono<WalletDTO> getWallet(ServerWebExchange exchange) {
    return this.walletRepository
        .findByUserId(AttributeStorage.getUser(exchange).getId())
        .doOnError(Throwable::printStackTrace)
        .map(
            wallet ->
                new WalletDTO(
                    wallet.getId().toString(),
                    wallet.getUserId().toString(),
                    wallet.getAddress(),
                    wallet.getPublicKey(),
                    Encryptor.decrypt(EncryptorProperties.SECRET_KEY, wallet.getShare1()),
                    wallet.getEncryptedShare3()));
  }
}
