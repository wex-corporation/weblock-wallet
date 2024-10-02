package com.altech.core.domain.coin;

import com.altech.core.domain.baseEntity.DomainEntity;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Table("user_coins")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class UserCoins extends DomainEntity {

  private static final String DELIMITER = ",";

  @Column("user_id")
  private UUID userId;

  @Column("coin_ids")
  private String coinIds;

  @Transient private List<Coin> coins;

  public static UserCoins create(UUID userId, List<Coin> coins) {
    return new UserCoins(
        userId,
        coins.stream().map(coin -> coin.getId().toString()).collect(Collectors.joining(DELIMITER)),
        null);
  }

  public List<UUID> getCoinIds() {
    return Arrays.stream(this.coinIds.split(DELIMITER))
        .map(UUID::fromString)
        .collect(Collectors.toList());
  }

  public void setCoinIds(List<UUID> coinIds) {
    this.coinIds = coinIds.stream().map(UUID::toString).collect(Collectors.joining(DELIMITER));
  }

  public void addCoinId(UUID coinId) {
    List<UUID> origins = this.getCoinIds();
    if (!origins.contains(coinId)) {
      origins.add(coinId);
      this.setCoinIds(origins);
    }
  }

  public void removeCoinId(UUID coinId) {
    List<UUID> origins = this.getCoinIds();
    if (origins.remove(coinId)) {
      this.setCoinIds(origins);
    }
  }
}
