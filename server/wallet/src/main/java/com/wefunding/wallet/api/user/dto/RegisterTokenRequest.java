package com.wefunding.wallet.api.user.dto;

public record RegisterTokenRequest(
    String blockchainId, String contractAddress, String name, String symbol, Integer decimals) {}
