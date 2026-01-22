package com.wefunding.wallet.api.wallet.dto;

public record UpsertDeviceRecoveryRequest(
    String deviceId, String encryptedShare2Device, String deviceSecret) {}
