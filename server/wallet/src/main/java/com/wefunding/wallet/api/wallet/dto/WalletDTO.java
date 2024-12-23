package com.wefunding.wallet.api.wallet.dto;

public record WalletDTO(
    String id,
    String userId,
    String address,
    String publicKey,
    String share1,
    String encryptedShare3) {}
