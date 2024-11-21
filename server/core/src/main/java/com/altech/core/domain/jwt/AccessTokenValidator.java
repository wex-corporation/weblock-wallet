package com.altech.core.domain.jwt;

import com.altech.core.domain.jwt.payload.AccessTokenPayload;
import com.altech.core.domain.user.User;
import com.altech.core.domain.user.UserRepository;
import com.altech.core.exceptions.BadRequestException;
import com.altech.core.exceptions.ErrorCode;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@AllArgsConstructor
public class AccessTokenValidator {

  private final AccessTokenDecoder accessTokenDecoder;
  private final UserRepository userRepository;
  private static final Logger log = LoggerFactory.getLogger(AccessTokenValidator.class);

  public Mono<User> validate(String accessToken) throws JsonProcessingException {
    log.debug("Validating access token: {}", accessToken);
    AccessTokenPayload payload;
    try {
      payload = this.accessTokenDecoder.decode(accessToken);
      log.debug("Decoded JWT payload: {}", payload);
    } catch (Exception e) {
      log.error("Failed to decode access token: {}", e.getMessage());
      throw new BadRequestException(ErrorCode.INVALID_ACCESS_TOKEN);
    }

    UUID userId = UUID.fromString(payload.getUserId());
    log.debug("Extracted userId from token: {}", userId);

    return this.userRepository
        .findById(userId)
        .doOnNext(user -> log.debug("Retrieved user from repository: {}", user))
        .flatMap(
            user -> {
              if (!user.getFirebaseId().equals(payload.getFirebaseId())) {
                log.warn(
                    "Firebase ID mismatch. Token: {}, User: {}",
                    payload.getFirebaseId(),
                    user.getFirebaseId());
                return Mono.error(new BadRequestException(ErrorCode.INVALID_ACCESS_TOKEN));
              }
              return Mono.just(user);
            })
        .switchIfEmpty(Mono.error(new BadRequestException(ErrorCode.USER_NOT_FOUND)));
  }
}
