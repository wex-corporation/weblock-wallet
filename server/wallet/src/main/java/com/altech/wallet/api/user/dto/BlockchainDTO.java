package com.altech.wallet.api.user.dto;

import java.util.UUID;

public record BlockchainDTO(
    UUID id,
    String name,
    String rpcUrl,
    long chainId,
    String currencySymbol,
    String currencyName,
    long currencyDecimals,
    String explorerUrl,
    boolean isTestnet) {}
