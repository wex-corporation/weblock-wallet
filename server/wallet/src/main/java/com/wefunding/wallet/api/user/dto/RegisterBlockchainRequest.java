package com.wefunding.wallet.api.user.dto;

public record RegisterBlockchainRequest(
    String name,
    String rpcUrl,
    long chainId,
    String currencySymbol,
    String currencyName,
    long currencyDecimals,
    String explorerUrl,
    boolean isTestnet) {}
