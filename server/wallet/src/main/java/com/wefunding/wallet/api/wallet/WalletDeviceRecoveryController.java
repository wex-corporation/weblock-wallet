package com.wefunding.wallet.api.wallet;

import com.wefunding.wallet.api.wallet.dto.DeviceRecoveryResponse;
import com.wefunding.wallet.api.wallet.dto.UpsertDeviceRecoveryRequest;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("v1/wallets/device-recovery")
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public class WalletDeviceRecoveryController {

  private final WalletDeviceRecoveryService service;

  @PutMapping
  public Mono<Void> upsert(
      ServerWebExchange exchange, @RequestBody UpsertDeviceRecoveryRequest req) {
    return service.upsert(exchange, req);
  }

  /**
   * If deviceId is omitted, returns the latest backup for the user. Never throws on "not found";
   * returns { found: false } instead.
   */
  @GetMapping
  public Mono<DeviceRecoveryResponse> get(
      ServerWebExchange exchange,
      @RequestParam(name = "deviceId", required = false) String deviceId) {
    return service.get(exchange, deviceId);
  }
}
