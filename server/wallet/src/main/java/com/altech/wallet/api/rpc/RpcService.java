package com.altech.wallet.api.rpc;

import com.altech.core.domain.blockchain.Blockchain;
import com.altech.core.domain.blockchain.BlockchainRepository;
import com.altech.core.domain.blockchain.UserBlockchainsRepository;
import com.altech.core.domain.rpc.RpcMethod;
import com.altech.core.domain.user.UserRepository;
import com.altech.core.exceptions.BadRequestException;
import com.altech.core.exceptions.ErrorCode;
import com.altech.core.exceptions.InternalServerException;
import com.altech.wallet.api.rpc.dto.JsonRpcObjectDTO;
import com.altech.wallet.api.rpc.dto.SendRpcRequest;
import com.altech.wallet.config.AttributeStorage;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Service
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class RpcService {

  private final RpcClient rpcClient;
  private final UserRepository userRepository;
  private final BlockchainRepository blockchainRepository;
  private final UserBlockchainsRepository userBlockchainsRepository;

  @Transactional
  public Mono<JsonRpcObjectDTO> sendRpc(ServerWebExchange exchange, SendRpcRequest request) {
    RpcMethod rpcMethod = RpcMethod.from(request.method());

    return this.userRepository
        .findWithBlockchainsById(
            this.blockchainRepository,
            this.userBlockchainsRepository,
            AttributeStorage.getUser(exchange).getId())
        .doOnError(Throwable::getStackTrace)
        .switchIfEmpty(Mono.error(new InternalServerException(ErrorCode.USER_NOT_FOUND)))
        // Extract RPC URL for the provided blockchain from the user's blockchains
        .flatMap(
            user ->
                Mono.justOrEmpty(
                        user.getBlockchains().stream()
                            .filter(b -> b.getChainId() == request.chainId())
                            .map(Blockchain::getRpcUrl)
                            .findFirst())
                    .switchIfEmpty(
                        Mono.error(new BadRequestException(ErrorCode.NOT_REGISTERED_BLOCKCHAIN))))
        // Based on the RPC method, send the appropriate request
        .flatMap(
            rpcUrl ->
                switch (rpcMethod) {
                    // TODO: save transaction to database
                  case ETH_SEND_RAW_TRANSACTION -> this.rpcClient
                      .sendRawTransaction(rpcUrl, (String) request.params().get(0))
                      .map(JsonRpcObjectDTO::transaction)
                      .switchIfEmpty(
                          Mono.error(
                              new InternalServerException(ErrorCode.FAILED_GETTING_RPC_RESPONSE)));
                  default -> this.rpcClient
                      .sendRpc(rpcUrl, request.jsonrpc(), request.id(), rpcMethod, request.params())
                      .map(JsonRpcObjectDTO::rpc)
                      .switchIfEmpty(
                          Mono.error(
                              new InternalServerException(ErrorCode.FAILED_GETTING_RPC_RESPONSE)));
                });
  }
}
