package com.wefunding.core.domain.nft;

import com.wefunding.core.domain.baseEntity.DomainEntity;
import com.wefunding.core.domain.blockchain.UserBlockchains;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Table("nfts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class NFT extends DomainEntity {

  private String name;
  private String symbol;
  private String type;

  @Column("blockchain_id")
  private UUID blockchainId;

  @Column("contract_address")
  private String contractAddress;

  @Transient private NFTMetadata metadata;

  public static NFT create(
      String name,
      String symbol,
      String type,
      UserBlockchains userBlockchains,
      String contractAddress) {
    return new NFT(
        name, symbol, type, userBlockchains.getId(), contractAddress.toLowerCase(), null);
  }

  public NFT withMetadata(NFTMetadata metadata) {
    this.metadata = metadata;
    return this;
  }
}
