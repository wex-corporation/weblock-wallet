package com.altech.core.domain.coin;

import com.altech.core.domain.baseEntity.DomainEntity;
import com.altech.core.domain.blockchain.Blockchain;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Table("coins")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Coin extends DomainEntity {

  private static final String COIN_ADDRESS = "0x0";
  private String name;
  private String symbol;

  @Column("blockchain_id")
  private UUID blockchainId;

  @Column("contract_address")
  private String contractAddress;

  @Column("is_default")
  private boolean isDefault;

  private long decimals;

  public static Coin ofDefault(String name, String symbol, UUID blockchainId, long decimals) {
    return new Coin(name, symbol, blockchainId, COIN_ADDRESS, true, decimals);
  }

  public static Coin coin(String name, String symbol, UUID blockchainId, long decimals) {
    return new Coin(name, symbol, blockchainId, COIN_ADDRESS, false, decimals);
  }

  public static Coin token(
      String name, String symbol, UUID blockchainId, String contractAddress, long decimals) {
    return new Coin(name, symbol, blockchainId, contractAddress.toLowerCase(), false, decimals);
  }

  public static List<Coin> defaults(List<Blockchain> blockchains) {
    List<Coin> coins = new ArrayList<>();
    blockchains.forEach(
        blockchain -> {
          coins.add(
              Coin.ofDefault(
                  blockchain.getCurrencyName(),
                  blockchain.getCurrencySymbol(),
                  blockchain.getId(),
                  blockchain.getCurrencyDecimals()));
        });
    return coins;
  }
}
