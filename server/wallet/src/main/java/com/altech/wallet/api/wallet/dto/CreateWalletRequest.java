package com.altech.wallet.api.wallet.dto;

public record CreateWalletRequest(
    String address, String publicKey, String share1, String encryptedShare3) {}
