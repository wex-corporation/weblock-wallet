package com.altech.core.domain.user;

import com.altech.core.domain.baseEntity.DomainEntity;
import com.altech.core.domain.blockchain.Blockchain;
import com.altech.core.domain.wallet.Wallet;
import java.util.List;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Slf4j
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Table("users")
public class User extends DomainEntity {

  @Column("org_id")
  private UUID orgId;

  private String email;

  @Column("firebase_id")
  private String firebaseId;

  private String provider;

  @Transient private Wallet wallet;

  @Transient private List<Blockchain> blockchains;

  public static User create(UUID orgId, String email, String firebaseId, String provider) {
    return new User(orgId, email, firebaseId, provider, null, null);
  }

  public User withBlockchains(List<Blockchain> blockchains) {
    this.blockchains = blockchains;
    return this;
  }

  public User withWallet(Wallet wallet) {
    this.wallet = wallet;
    return this;
  }
}
