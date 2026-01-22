package com.wefunding.wallet.api.wallet.dto;

public record DeviceRecoveryResponse(
    boolean found, String deviceId, String encryptedShare2Device, String deviceSecret) {
  public static DeviceRecoveryResponse notFound() {
    return new DeviceRecoveryResponse(false, null, null, null);
  }

  public static DeviceRecoveryResponse found(
      String deviceId, String encryptedShare2Device, String deviceSecret) {
    return new DeviceRecoveryResponse(true, deviceId, encryptedShare2Device, deviceSecret);
  }
}
