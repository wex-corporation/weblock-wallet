package com.wefunding.wallet.api.user;

import com.wefunding.core.domain.blockchain.Blockchain;
import com.wefunding.core.domain.blockchain.BlockchainRepository;
import com.wefunding.core.domain.coin.Coin;
import com.wefunding.core.domain.coin.CoinRepository;
import com.wefunding.core.domain.rpc.JsonRpcObject;
import com.wefunding.core.domain.rpc.RpcMethod;
import com.wefunding.wallet.api.rpc.RpcClient;
import com.wefunding.wallet.api.user.dto.BlockchainDTO;
import com.wefunding.wallet.api.user.dto.CoinDTO;
import com.wefunding.wallet.api.user.dto.RegisterBlockchainRequest;
import com.wefunding.wallet.api.user.dto.RegisterTokenRequest;
import com.wefunding.wallet.api.user.dto.SignInRequest;
import com.wefunding.wallet.api.user.dto.SignInResponse;
import com.wefunding.wallet.api.user.dto.UserDTO;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
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
  private final BlockchainRepository blockchainRepository;
  private final RpcClient rpcClient;

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
  public Mono<Coin> registerToken(
      ServerWebExchange exchange, @RequestBody RegisterTokenRequest req) {
    final UUID blockchainId = parseUuidOr400(req.blockchainId(), "blockchainId is required");
    final String contractAddress = normalizeAddressOr400(req.contractAddress());

    final boolean hasMeta =
        req.name() != null
            && !req.name().isBlank()
            && req.symbol() != null
            && !req.symbol().isBlank()
            && req.decimals() != null;

    if (!hasMeta) {
      // ✅ 메타가 없는 요청도 허용하되,
      //   1) 이미 등록된 토큰이면 그대로 반환
      //   2) 미등록 토큰이면 RPC(eth_call)로 name/symbol/decimals 를 조회하여 자동 등록
      return coinRepository
          .findByBlockchainIdAndContractAddress(blockchainId, contractAddress)
          .switchIfEmpty(
              blockchainRepository
                  .findById(blockchainId)
                  .switchIfEmpty(
                      Mono.error(
                          new ResponseStatusException(
                              HttpStatus.BAD_REQUEST, "Unknown blockchainId: " + blockchainId)))
                  .flatMap(chain -> resolveErc20Metadata(chain, contractAddress))
                  .flatMap(
                      meta ->
                          coinRepository.upsertToken(
                              meta.name(),
                              meta.symbol(),
                              blockchainId,
                              contractAddress,
                              meta.decimals())))
          .flatMap(coin -> this.userService.attachCoinToUser(exchange, coin));
    }

    if (req.decimals() <= 0) {
      return Mono.error(
          new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "decimals must be a positive number"));
    }

    // ✅ 메타가 있으면 upsert (중복이어도 OK), null overwrite는 COALESCE로 방지됨
    return coinRepository
        .upsertToken(
            req.name().trim(), req.symbol().trim(), blockchainId, contractAddress, req.decimals())
        .flatMap(coin -> this.userService.attachCoinToUser(exchange, coin));
  }

  /**
   * ERC20 표준 메타데이터(name/symbol/decimals)를 RPC eth_call로 조회한다. - name(): 0x06fdde03 - symbol():
   * 0x95d89b41 - decimals():0x313ce567
   */
  private Mono<TokenMeta> resolveErc20Metadata(Blockchain chain, String contractAddress) {
    // 병렬 조회
    Mono<String> nameM =
        callEvmString(chain.getRpcUrl(), contractAddress, "0x06fdde03")
            .onErrorResume(e -> Mono.empty());
    Mono<String> symbolM =
        callEvmString(chain.getRpcUrl(), contractAddress, "0x95d89b41")
            .onErrorResume(e -> Mono.empty());
    Mono<Integer> decimalsM =
        callEvmUint(chain.getRpcUrl(), contractAddress, "0x313ce567").onErrorReturn(18);

    return Mono.zip(nameM.defaultIfEmpty(""), symbolM.defaultIfEmpty(""), decimalsM)
        .flatMap(
            t -> {
              final String name = t.getT1() == null ? "" : t.getT1().trim();
              final String symbol = t.getT2() == null ? "" : t.getT2().trim();
              final Integer decimals = t.getT3();

              if (name.isBlank() || symbol.isBlank()) {
                return Mono.error(
                    new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Token metadata (name, symbol, decimals) is required for new token registration. "
                            + "RPC lookup failed or returned empty values. "
                            + "Please provide name/symbol/decimals in the request."));
              }
              if (decimals == null || decimals < 0 || decimals > 255) {
                return Mono.error(
                    new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid token decimals from RPC: "
                            + decimals
                            + ". Please provide decimals."));
              }
              return Mono.just(new TokenMeta(name, symbol, decimals));
            });
  }

  private Mono<String> callEvmString(String rpcUrl, String to, String data) {
    return ethCall(rpcUrl, to, data).map(UserController::decodeEvmString);
  }

  private Mono<Integer> callEvmUint(String rpcUrl, String to, String data) {
    return ethCall(rpcUrl, to, data)
        .map(
            hex -> {
              if (hex == null || hex.equals("0x") || hex.length() < 3) return 18;
              final String h = hex.startsWith("0x") ? hex.substring(2) : hex;
              if (h.isBlank()) return 18;
              return new BigInteger(h, 16).intValue();
            });
  }

  private Mono<String> ethCall(String rpcUrl, String to, String data) {
    // eth_call params: [{to, data}, "latest"]
    return rpcClient
        .sendRpc(
            rpcUrl, "2.0", 1, RpcMethod.ETH_CALL, List.of(Map.of("to", to, "data", data), "latest"))
        .flatMap(
            (JsonRpcObject rpc) -> {
              if (rpc == null) {
                return Mono.error(
                    new ResponseStatusException(HttpStatus.BAD_REQUEST, "RPC response is null"));
              }
              if (rpc.hasError()) {
                return Mono.error(
                    new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "RPC error: "
                            + (rpc.getError() == null ? "unknown" : rpc.getError().getMessage())));
              }
              final Object result = rpc.getResult();
              if (result == null) return Mono.just("0x");
              return Mono.just(String.valueOf(result));
            });
  }

  /**
   * ABI encoded string(bytes) / bytes32 대응. - dynamic string: offset(32) + length(32) + data -
   * bytes32: 32 bytes fixed
   */
  private static String decodeEvmString(String hex) {
    if (hex == null) return "";
    if (hex.equals("0x")) return "";
    final String data = hex.startsWith("0x") ? hex.substring(2) : hex;
    if (data.isBlank()) return "";

    // bytes32 형태(정확히 32bytes)
    if (data.length() == 64) {
      byte[] bytes = hexToBytes(data);
      return new String(trimZeroRight(bytes), StandardCharsets.UTF_8).trim();
    }

    // dynamic string 형태
    if (data.length() < 128) {
      return "";
    }

    try {
      int offset = new BigInteger(data.substring(0, 64), 16).intValueExact() * 2;
      if (offset < 0 || offset + 64 > data.length()) return "";

      int len = new BigInteger(data.substring(offset, offset + 64), 16).intValueExact();
      int start = offset + 64;
      int end = start + (len * 2);
      if (len < 0 || end > data.length()) return "";

      String strHex = data.substring(start, end);
      byte[] bytes = hexToBytes(strHex);
      return new String(bytes, StandardCharsets.UTF_8).trim();
    } catch (Exception ignore) {
      return "";
    }
  }

  private static byte[] hexToBytes(String hex) {
    final int len = hex.length();
    final byte[] out = new byte[len / 2];
    for (int i = 0; i < len; i += 2) {
      out[i / 2] = (byte) Integer.parseInt(hex.substring(i, i + 2), 16);
    }
    return out;
  }

  private static byte[] trimZeroRight(byte[] bytes) {
    int end = bytes.length;
    while (end > 0 && bytes[end - 1] == 0) end--;
    if (end == bytes.length) return bytes;
    byte[] out = new byte[end];
    System.arraycopy(bytes, 0, out, 0, end);
    return out;
  }

  private record TokenMeta(String name, String symbol, Integer decimals) {}

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
