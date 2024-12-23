package com.wefunding.wallet.api.user.dto;

import java.util.UUID;

public record RegisterTokenRequest(
    UUID blockchainId, String name, String symbol, String contractAddress, long decimals) {}
