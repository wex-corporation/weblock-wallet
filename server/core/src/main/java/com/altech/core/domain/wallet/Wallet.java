package com.altech.core.domain.wallet;

import com.altech.core.domain.baseEntity.DomainEntity;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Slf4j
@Getter
@NoArgsConstructor
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
@Table("wallets")
public class Wallet extends DomainEntity {

  @Column("user_id")
  private UUID userId;

  private String address;

  @Column("public_key")
  private String publicKey;

  @Column("share_1")
  private String share1;

  @Column("encrypted_share_3")
  private String encryptedShare3;

  public static Wallet create(
      UUID userId, String address, String publicKey, String share1, String encryptedShare3) {
    return new Wallet(userId, address, publicKey, share1, encryptedShare3);
  }

  public void updateWalletKey(String share1, String encryptedShare3) {
    this.share1 = share1;
    this.encryptedShare3 = encryptedShare3;
  }
}
