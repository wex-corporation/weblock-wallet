package com.altech.wallet.api.wallet;

import com.altech.wallet.api.wallet.dto.CreateWalletRequest;
import com.altech.wallet.api.wallet.dto.UpdateKeyRequest;
import com.altech.wallet.api.wallet.dto.WalletDTO;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("v1/wallets")
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public class WalletController {

  private final WalletService walletService;

  @PostMapping
  public Mono<Void> createWallet(
      ServerWebExchange exchange, @RequestBody final CreateWalletRequest request) {
    return this.walletService.createWallet(exchange, request);
  }

  @PatchMapping("/keys")
  public Mono<Void> updateWalletKey(
      ServerWebExchange exchange, @RequestBody final UpdateKeyRequest request) {
    return this.walletService.updateWalletKey(exchange, request);
  }

  @GetMapping
  public Mono<WalletDTO> getWallet(ServerWebExchange exchange) {
    return this.walletService.getWallet(exchange);
  }
}
