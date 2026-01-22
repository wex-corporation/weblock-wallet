package com.wefunding.core.domain.wallet;

import com.wefunding.core.domain.baseEntity.DomainEntity;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Getter
@NoArgsConstructor
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
@Table("wallet_device_recoveries")
public class WalletDeviceRecovery extends DomainEntity {

  @Column("org_id")
  private UUID orgId;

  @Column("user_id")
  private UUID userId;

  @Column("device_id")
  private String deviceId;

  @Column("encrypted_share2_device")
  private String encryptedShare2Device;

  @Column("device_secret_enc")
  private String deviceSecretEnc;

  public static WalletDeviceRecovery create(
      UUID orgId,
      UUID userId,
      String deviceId,
      String encryptedShare2Device,
      String deviceSecretEnc) {
    return new WalletDeviceRecovery(
        orgId, userId, deviceId, encryptedShare2Device, deviceSecretEnc);
  }

  public void update(String encryptedShare2Device, String deviceSecretEnc) {
    this.encryptedShare2Device = encryptedShare2Device;
    this.deviceSecretEnc = deviceSecretEnc;
  }
}
