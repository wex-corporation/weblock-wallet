package com.wefunding.core.domain.nft;

import com.wefunding.core.domain.baseEntity.DomainEntity;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@Table("nft_metadata")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class NFTMetadata extends DomainEntity {

  @Column("nft_id")
  private UUID nftId;

  private String name;

  @Column("token_id")
  private String tokenId;

  @Column("image_url")
  private String imageUrl;

  private String metadata;
}
