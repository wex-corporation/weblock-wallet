package com.wefunding.wallet.api.user;

import com.wefunding.core.domain.coin.Coin;
import com.wefunding.core.domain.coin.CoinRepository;
import com.wefunding.wallet.api.user.dto.BlockchainDTO;
import com.wefunding.wallet.api.user.dto.CoinDTO;
import com.wefunding.wallet.api.user.dto.RegisterBlockchainRequest;
import com.wefunding.wallet.api.user.dto.RegisterTokenRequest;
import com.wefunding.wallet.api.user.dto.SignInRequest;
import com.wefunding.wallet.api.user.dto.SignInResponse;
import com.wefunding.wallet.api.user.dto.UserDTO;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("v1/users")
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public class UserController {

  private final UserService userService;
  private final CoinRepository coinRepository;

  @PostMapping("/sign-in")
  public Mono<SignInResponse> signIn(
      @RequestHeader("X-Al-Api-Key") final String apiKey,
      @RequestBody final SignInRequest request) {
    return this.userService.signIn(apiKey, request);
  }

  @GetMapping
  public Mono<UserDTO> getUser(ServerWebExchange exchange) {
    return this.userService.getUser(exchange);
  }

  //  @PostMapping("/register-token")
  //  public Mono<CoinDTO> registerToken(
  //      ServerWebExchange exchange, @RequestBody final RegisterTokenRequest request) {
  //    return this.userService.registerToken(exchange, request);
  //  }

  @PostMapping("/register-token")
  public Mono<Coin> registerToken(@RequestBody RegisterTokenRequest req) {
    final UUID blockchainId = parseUuidOr400(req.blockchainId(), "blockchainId is required");
    final String contractAddress = normalizeAddressOr400(req.contractAddress());

    final boolean hasMeta =
        req.name() != null
            && !req.name().isBlank()
            && req.symbol() != null
            && !req.symbol().isBlank()
            && req.decimals() != null;

    if (!hasMeta) {
      // ✅ 메타가 없는 요청은 "이미 존재하는 coin"에 대해서만 idempotent하게 허용
      return coinRepository
          .findByBlockchainIdAndContractAddress(blockchainId, contractAddress)
          .switchIfEmpty(
              Mono.error(
                  new ResponseStatusException(
                      HttpStatus.BAD_REQUEST,
                      "Token metadata (name, symbol, decimals) is required for new token registration.")));
    }

    if (req.decimals() <= 0) {
      return Mono.error(
          new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "decimals must be a positive number"));
    }

    // ✅ 메타가 있으면 upsert (중복이어도 OK), null overwrite는 COALESCE로 방지됨
    return coinRepository.upsertToken(
        req.name().trim(), req.symbol().trim(), blockchainId, contractAddress, req.decimals());
  }

  private static UUID parseUuidOr400(String raw, String message) {
    if (raw == null || raw.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
    try {
      return UUID.fromString(raw.trim());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid UUID: " + raw);
    }
  }

  private static String normalizeAddressOr400(String raw) {
    if (raw == null || raw.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "contractAddress is required");
    }
    final String v = raw.trim().toLowerCase();
    // EVM address basic validation (optional but recommended)
    if (!v.matches("^0x[a-f0-9]{40}$")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid contractAddress: " + raw);
    }
    return v;
  }

  @GetMapping("/coins")
  public Flux<CoinDTO> getRegisteredCoins(
      ServerWebExchange exchange, @RequestParam final String blockchainId) {
    return this.userService.getRegisteredCoins(exchange, blockchainId);
  }

  @PostMapping("/register-blockchain")
  public Mono<Void> registerBlockchain(
      ServerWebExchange exchange, @RequestBody final RegisterBlockchainRequest request) {
    return this.userService.registerBlockchain(exchange, request);
  }

  @GetMapping("/blockchains")
  public Flux<BlockchainDTO> getRegisteredBlockchains(ServerWebExchange exchange) {
    return this.userService.getRegisteredBlockchains(exchange);
  }
}
