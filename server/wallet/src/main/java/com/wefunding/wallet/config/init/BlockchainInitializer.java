package com.wefunding.wallet.config.init;

import com.wefunding.core.domain.blockchain.Blockchain;
import com.wefunding.core.domain.blockchain.BlockchainRepository;
import com.wefunding.core.domain.coin.Coin;
import com.wefunding.core.domain.coin.CoinRepository;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import reactor.core.publisher.Mono;

@Configuration
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Order(2)
public class BlockchainInitializer implements CommandLineRunner {

  private final BlockchainRepository blockchainRepository;
  private final CoinRepository coinRepository;

  @Override
  public void run(String... args) {
    this.blockchainRepository
        .findAllByIsDefaultIsTrue()
        .collectList()
        .flatMap(
            list ->
                list.isEmpty()
                    ? this.blockchainRepository
                        .saveAll(Blockchain.defaults())
                        .collectList()
                        .flatMap(
                            blockchains ->
                                this.coinRepository
                                    .saveAll(Coin.defaults(blockchains))
                                    .collectList())
                    : Mono.just(list))
        .block();
  }
}
