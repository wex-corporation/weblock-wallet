package com.wefunding.wallet.api.user.dto;

import java.util.UUID;

public record CoinDTO(
    UUID id,
    UUID blockchainId,
    String name,
    String symbol,
    String contractAddress,
    long decimals) {}
