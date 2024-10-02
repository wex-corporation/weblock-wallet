package com.altech.core.domain.blockchain;

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
@Table("user_blockchains")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class UserBlockchains extends DomainEntity {

  private static final String DELIMITER = ",";

  @Column("user_id")
  private UUID userId;

  @Column("blockchain_ids")
  private String blockchainIds;

  @Transient private List<Blockchain> blockchains;

  public static UserBlockchains create(UUID userId, List<Blockchain> blockchains) {
    return new UserBlockchains(
        userId,
        blockchains.stream()
            .map(blockchain -> blockchain.getId().toString())
            .collect(Collectors.joining(DELIMITER)),
        null);
  }

  public List<UUID> getBlockchainIds() {
    return Arrays.stream(this.blockchainIds.split(DELIMITER))
        .map(UUID::fromString)
        .collect(Collectors.toList());
  }

  public void setBlockchainIds(List<UUID> blockchainsIds) {
    this.blockchainIds =
        blockchainsIds.stream().map(UUID::toString).collect(Collectors.joining(DELIMITER));
  }

  public void addBlockchainId(UUID blockchainId) {
    List<UUID> origins = this.getBlockchainIds();
    if (!origins.contains(blockchainId)) {
      origins.add(blockchainId);
      this.setBlockchainIds(origins);
    }
  }

  public void removeBlockchainId(UUID blockchainId) {
    List<UUID> origins = this.getBlockchainIds();
    if (origins.remove(blockchainId)) {
      this.setBlockchainIds(origins);
    }
  }
}
