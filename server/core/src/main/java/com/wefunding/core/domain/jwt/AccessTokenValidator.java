package com.wefunding.core.domain.jwt;

import com.wefunding.core.domain.jwt.payload.AccessTokenPayload;
import com.wefunding.core.domain.user.User;
import com.wefunding.core.domain.user.UserRepository;
import com.wefunding.core.exceptions.AuthorizationException;
import com.wefunding.core.exceptions.ErrorCode;
import com.wefunding.core.exceptions.JWTException;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@AllArgsConstructor
public class AccessTokenValidator {

  private final AccessTokenDecoder accessTokenDecoder;
  private final UserRepository userRepository;

  public Mono<User> validate(String accessToken) {
    AccessTokenPayload payload = this.accessTokenDecoder.decode(accessToken);
    if (payload.getUserId() == null || payload.getFirebaseId() == null) {
      return Mono.error(new JWTException(ErrorCode.INVALID_ACCESS_TOKEN));
    }

    UUID userId;
    try {
      userId = UUID.fromString(payload.getUserId());
    } catch (IllegalArgumentException e) {
      return Mono.error(new JWTException(ErrorCode.INVALID_ACCESS_TOKEN));
    }

    return this.userRepository
        .findById(userId)
        .flatMap(
            user -> {
              if (!user.getFirebaseId().equals(payload.getFirebaseId())) {
                return Mono.error(new AuthorizationException(ErrorCode.INVALID_ACCESS_TOKEN));
              }
              return Mono.just(user);
            })
        .switchIfEmpty(Mono.error(new AuthorizationException(ErrorCode.USER_NOT_FOUND)));
  }
}
