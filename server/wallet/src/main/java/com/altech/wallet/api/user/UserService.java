package com.altech.wallet.api.user;

import com.altech.core.domain.blockchain.Blockchain;
import com.altech.core.domain.blockchain.BlockchainRepository;
import com.altech.core.domain.blockchain.UserBlockchains;
import com.altech.core.domain.blockchain.UserBlockchainsRepository;
import com.altech.core.domain.coin.Coin;
import com.altech.core.domain.coin.CoinRepository;
import com.altech.core.domain.coin.UserCoins;
import com.altech.core.domain.coin.UserCoinsRepository;
import com.altech.core.domain.jwt.AccessTokenGenerator;
import com.altech.core.domain.organization.OrganizationRepository;
import com.altech.core.domain.user.User;
import com.altech.core.domain.user.UserRepository;
import com.altech.core.domain.wallet.WalletRepository;
import com.altech.core.exceptions.BadRequestException;
import com.altech.core.exceptions.ErrorCode;
import com.altech.wallet.api.user.dto.BlockchainDTO;
import com.altech.wallet.api.user.dto.CoinDTO;
import com.altech.wallet.api.user.dto.RegisterBlockchainRequest;
import com.altech.wallet.api.user.dto.RegisterTokenRequest;
import com.altech.wallet.api.user.dto.SignInRequest;
import com.altech.wallet.api.user.dto.SignInResponse;
import com.altech.wallet.api.user.dto.UserDTO;
import com.altech.wallet.config.AttributeStorage;
import com.altech.wallet.infra.auth.FirebaseVerifier;
import com.google.firebase.auth.FirebaseAuthException;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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

  @Transactional
  public Mono<CoinDTO> registerToken(ServerWebExchange exchange, RegisterTokenRequest request) {
    return this.coinRepository
        .findByBlockchainIdAndContractAddress(request.blockchainId(), request.contractAddress())
        .switchIfEmpty(
            this.coinRepository.save(
                Coin.token(
                    request.name(),
                    request.symbol(),
                    request.blockchainId(),
                    request.contractAddress(),
                    request.decimals())))
        .flatMap(
            coin ->
                this.userCoinsRepository
                    .findByUserId(AttributeStorage.getUser(exchange).getId())
                    .flatMap(
                        userCoins -> {
                          userCoins.addCoinId(coin.getId());
                          return this.userCoinsRepository.save(userCoins);
                        })
                    .thenReturn(
                        new CoinDTO(
                            coin.getId(),
                            coin.getBlockchainId(),
                            coin.getName(),
                            coin.getSymbol(),
                            coin.getContractAddress(),
                            coin.getDecimals())));
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
