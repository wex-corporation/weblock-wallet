package com.altech.wallet.api.user;

import com.altech.wallet.api.user.dto.BlockchainDTO;
import com.altech.wallet.api.user.dto.CoinDTO;
import com.altech.wallet.api.user.dto.RegisterBlockchainRequest;
import com.altech.wallet.api.user.dto.RegisterTokenRequest;
import com.altech.wallet.api.user.dto.SignInRequest;
import com.altech.wallet.api.user.dto.SignInResponse;
import com.altech.wallet.api.user.dto.UserDTO;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("v1/users")
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public class UserController {

  private final UserService userService;

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

  @PostMapping("/register-token")
  public Mono<CoinDTO> registerToken(
      ServerWebExchange exchange, @RequestBody final RegisterTokenRequest request) {
    return this.userService.registerToken(exchange, request);
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
