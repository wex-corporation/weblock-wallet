package com.altech.wallet.api.user.dto;

import java.util.List;
import java.util.UUID;

public record UserDTO(
    UUID id,
    UUID orgId,
    String email,
    String firebaseId,
    String provider,
    List<BlockchainDTO> blockchains) {}
