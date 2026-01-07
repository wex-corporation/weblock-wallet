package com.wefunding.wallet.api.user;

import com.google.firebase.auth.FirebaseAuthException;
import com.wefunding.core.domain.blockchain.Blockchain;
import com.wefunding.core.domain.blockchain.BlockchainRepository;
import com.wefunding.core.domain.blockchain.UserBlockchains;
import com.wefunding.core.domain.blockchain.UserBlockchainsRepository;
import com.wefunding.core.domain.coin.Coin;
import com.wefunding.core.domain.coin.CoinRepository;
import com.wefunding.core.domain.coin.UserCoins;
import com.wefunding.core.domain.coin.UserCoinsRepository;
import com.wefunding.core.domain.jwt.AccessTokenGenerator;
import com.wefunding.core.domain.organization.OrganizationRepository;
import com.wefunding.core.domain.user.User;
import com.wefunding.core.domain.user.UserRepository;
import com.wefunding.core.domain.wallet.WalletRepository;
import com.wefunding.core.exceptions.BadRequestException;
import com.wefunding.core.exceptions.ErrorCode;
import com.wefunding.wallet.api.user.dto.BlockchainDTO;
import com.wefunding.wallet.api.user.dto.CoinDTO;
import com.wefunding.wallet.api.user.dto.RegisterBlockchainRequest;
import com.wefunding.wallet.api.user.dto.RegisterTokenRequest;
import com.wefunding.wallet.api.user.dto.SignInRequest;
import com.wefunding.wallet.api.user.dto.SignInResponse;
import com.wefunding.wallet.api.user.dto.UserDTO;
import com.wefunding.wallet.config.AttributeStorage;
import com.wefunding.wallet.infra.auth.FirebaseVerifier;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class UserService {

  private final OrganizationRepository organizationRepository;
  private final UserRepository userRepository;
  private final BlockchainRepository blockchainRepository;
  private final UserBlockchainsRepository userBlockchainsRepository;
  private final CoinRepository coinRepository;
  private final UserCoinsRepository userCoinsRepository;
  private final WalletRepository walletRepository;
  private final FirebaseVerifier firebaseVerifier;
  private final AccessTokenGenerator accessTokenGenerator;

  @Transactional(readOnly = true)
  public Mono<UserDTO> getUser(ServerWebExchange exchange) {
    return this.userRepository
        .findWithBlockchainsById(
            this.blockchainRepository,
            this.userBlockchainsRepository,
            AttributeStorage.getUser(exchange).getId())
        .switchIfEmpty(Mono.error(new BadRequestException(ErrorCode.USER_NOT_FOUND)))
        .flatMap(
            user ->
                Mono.just(
                    new UserDTO(
                        user.getId(),
                        user.getOrgId(),
                        user.getEmail(),
                        user.getFirebaseId(),
                        user.getProvider(),
                        user.getBlockchains().stream()
                            .map(
                                blockchain ->
                                    new BlockchainDTO(
                                        blockchain.getId(),
                                        blockchain.getName(),
                                        blockchain.getRpcUrl(),
                                        blockchain.getChainId(),
                                        blockchain.getCurrencySymbol(),
                                        blockchain.getCurrencyName(),
                                        blockchain.getCurrencyDecimals(),
                                        blockchain.getExplorerUrl(),
                                        blockchain.isTestnet()))
                            .toList())));
  }

  @Transactional
  public Mono<SignInResponse> signIn(String apiKey, SignInRequest request) {
    log.info(
        ">>>>>>>>>>>>>>>>>>>>>>>       [signIn] apiKey: {} {} {} {} {}",
        apiKey,
        request.email(),
        request.firebaseId(),
        request.idToken(),
        request.provider());

    return this.firebaseVerifier
        .verify(request.firebaseId(), request.idToken())
        .filter(verified -> verified)
        .flatMap(
            verificationResult ->
                this.organizationRepository
                    .findByApiKey(apiKey)
                    .switchIfEmpty(
                        Mono.error(new BadRequestException(ErrorCode.ORGANIZATION_NOT_FOUND)))
                    .flatMap(
                        organization ->
                            this.userRepository
                                .findWithBlockchainsByOrgIdAndFirebaseId(
                                    this.blockchainRepository,
                                    this.userBlockchainsRepository,
                                    organization.getId(),
                                    request.firebaseId())
                                .flatMap(
                                    existingUser ->
                                        this.walletRepository
                                            .existsByUserId(existingUser.getId())
                                            .flatMap(
                                                exists ->
                                                    Mono.just(
                                                        new SignInResponse(
                                                            this.accessTokenGenerator.create(
                                                                existingUser.getId().toString(),
                                                                existingUser.getFirebaseId(),
                                                                existingUser.getEmail()),
                                                            !exists))))
                                .switchIfEmpty(
                                    Mono.defer(
                                        () -> {
                                          User newUser =
                                              User.create(
                                                  organization.getId(),
                                                  request.email(),
                                                  request.firebaseId(),
                                                  request.provider());
                                          return this.userRepository
                                              .save(newUser)
                                              .flatMap(
                                                  savedUser ->
                                                      Mono.zip(
                                                              this.blockchainRepository
                                                                  .findAllByIsDefaultIsTrue()
                                                                  .collectList()
                                                                  .flatMap(
                                                                      defaultBlockchains -> {
                                                                        UserBlockchains
                                                                            userBlockchains =
                                                                                UserBlockchains
                                                                                    .create(
                                                                                        savedUser
                                                                                            .getId(),
                                                                                        defaultBlockchains);
                                                                        return this
                                                                            .userBlockchainsRepository
                                                                            .save(userBlockchains);
                                                                      }),
                                                              this.coinRepository
                                                                  .findAllByIsDefaultIsTrue()
                                                                  .collectList()
                                                                  .flatMap(
                                                                      defaultCoins -> {
                                                                        UserCoins userCoins =
                                                                            UserCoins.create(
                                                                                savedUser.getId(),
                                                                                defaultCoins);
                                                                        return this
                                                                            .userCoinsRepository
                                                                            .save(userCoins);
                                                                      }))
                                                          .then(
                                                              Mono.just(
                                                                  new SignInResponse(
                                                                      this.accessTokenGenerator
                                                                          .create(
                                                                              savedUser
                                                                                  .getId()
                                                                                  .toString(),
                                                                              savedUser
                                                                                  .getFirebaseId(),
                                                                              savedUser.getEmail()),
                                                                      true))));
                                        }))
                                .onErrorResume(
                                    FirebaseAuthException.class,
                                    e ->
                                        Mono.error(
                                            new BadRequestException(
                                                ErrorCode.FIREBASE_VERIFICATION_ERROR)))
                                .onErrorResume(
                                    Exception.class,
                                    e ->
                                        Mono.error(
                                            new BadRequestException(
                                                e.getMessage(), ErrorCode.UNKNOWN_ERROR)))));
  }

  @Transactional
  public Mono<Void> registerBlockchain(
      ServerWebExchange exchange, RegisterBlockchainRequest request) {
    return this.userBlockchainsRepository
        .findByUserId(AttributeStorage.getUser(exchange).getId())
        .flatMapMany(
            userBlockchains ->
                this.blockchainRepository.findAllByIdIsIn(userBlockchains.getBlockchainIds()))
        .filter(userBlockchain -> userBlockchain.getChainId() == request.chainId())
        .collectList()
        .flatMap(
            blockchains -> {
              if (blockchains.isEmpty()) {
                Blockchain blockchain =
                    Blockchain.create(
                        request.name(),
                        request.rpcUrl(),
                        request.chainId(),
                        request.currencySymbol(),
                        request.currencyName(),
                        request.currencyDecimals(),
                        request.isTestnet(),
                        request.explorerUrl());

                return this.blockchainRepository
                    .save(blockchain)
                    .flatMap(
                        savedBlockchain ->
                            this.userBlockchainsRepository
                                .findByUserId(AttributeStorage.getUser(exchange).getId())
                                .flatMap(
                                    userBlockchains -> {
                                      userBlockchains.addBlockchainId(savedBlockchain.getId());
                                      return this.userBlockchainsRepository.save(userBlockchains);
                                    }))
                    .then();
              } else {
                return Mono.empty();
              }
            });
  }

  @Transactional(readOnly = true)
  public Flux<BlockchainDTO> getRegisteredBlockchains(ServerWebExchange exchange) {
    return this.userBlockchainsRepository
        .findByUserId(AttributeStorage.getUser(exchange).getId())
        .flatMapMany(
            userBlockchains ->
                this.blockchainRepository.findAllByIdIsIn(userBlockchains.getBlockchainIds()))
        .map(
            blockchain ->
                new BlockchainDTO(
                    blockchain.getId(),
                    blockchain.getName(),
                    blockchain.getRpcUrl(),
                    blockchain.getChainId(),
                    blockchain.getCurrencySymbol(),
                    blockchain.getCurrencyName(),
                    blockchain.getCurrencyDecimals(),
                    blockchain.getExplorerUrl(),
                    blockchain.isTestnet()));
  }

  //  @Transactional
  //  public Mono<CoinDTO> registerToken(ServerWebExchange exchange, RegisterTokenRequest request) {
  //    return this.coinRepository
  //        .findByBlockchainIdAndContractAddress(request.blockchainId(), request.contractAddress())
  //        .switchIfEmpty(
  //            this.coinRepository.save(
  //                Coin.token(
  //                    request.name(),
  //                    request.symbol(),
  //                    request.blockchainId(),
  //                    request.contractAddress(),
  //                    request.decimals())))
  //        .flatMap(
  //            coin ->
  //                this.userCoinsRepository
  //                    .findByUserId(AttributeStorage.getUser(exchange).getId())
  //                    .flatMap(
  //                        userCoins -> {
  //                          userCoins.addCoinId(coin.getId());
  //                          return this.userCoinsRepository.save(userCoins);
  //                        })
  //                    .thenReturn(
  //                        new CoinDTO(
  //                            coin.getId(),
  //                            coin.getBlockchainId(),
  //                            coin.getName(),
  //                            coin.getSymbol(),
  //                            coin.getContractAddress(),
  //                            coin.getDecimals())));
  //  }

  public Mono<Coin> registerToken(RegisterTokenRequest req /*, UUID userId */) {
    UUID blockchainId = req.blockchainId();
    String contract = normalizeAddress(req.contractAddress());

    Integer decimals = (int) req.decimals();
    if (decimals == null) {
      // 현재 요청은 decimals가 항상 오지만, 방어적으로 처리
      decimals = 18;
    }

    // 핵심: upsert로 중복 등록을 “성공” 처리
    return coinRepository
        .upsertToken(req.name(), req.symbol(), blockchainId, contract, decimals)
        .flatMap(
            coin -> {
              // 유저-코인 매핑이 있다면 여기서도 upsert/ignore로 처리해야 “재로그인 유지”가 확실해집니다.
              // return userCoinRepository.insertIgnore(userId, coin.getId()).thenReturn(coin);

              return Mono.just(coin);
            });
  }

  private String normalizeAddress(String address) {
    if (address == null) return null;
    return address.trim().toLowerCase();
  }

  @Transactional(readOnly = true)
  public Flux<CoinDTO> getRegisteredCoins(ServerWebExchange exchange, String blockchainId) {
    return this.userCoinsRepository
        .findByUserId(AttributeStorage.getUser(exchange).getId())
        .flatMapMany(userCoins -> this.coinRepository.findAllByIdIsIn(userCoins.getCoinIds()))
        .filter(
            coin -> blockchainId == null || coin.getBlockchainId().toString().equals(blockchainId))
        .map(
            coin ->
                new CoinDTO(
                    coin.getId(),
                    coin.getBlockchainId(),
                    coin.getName(),
                    coin.getSymbol(),
                    coin.getContractAddress(),
                    coin.getDecimals()));
  }
}
