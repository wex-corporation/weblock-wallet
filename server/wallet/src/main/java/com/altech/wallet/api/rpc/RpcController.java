package com.altech.wallet.api.rpc;

import com.altech.wallet.api.rpc.dto.JsonRpcObjectDTO;
import com.altech.wallet.api.rpc.dto.SendRpcRequest;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("v1/rpcs")
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public class RpcController {

  private final RpcService rpcService;

  @PostMapping
  public Mono<JsonRpcObjectDTO> sendRpc(
      ServerWebExchange exchange, @RequestBody final SendRpcRequest request) {
    return this.rpcService.sendRpc(exchange, request);
  }
}
