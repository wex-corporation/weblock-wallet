package com.wefunding.core.domain.jwt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.wefunding.core.domain.jwt.payload.AccessTokenPayload;
import com.wefunding.core.domain.user.User;
import com.wefunding.core.domain.user.UserRepository;
import com.wefunding.core.exceptions.BadRequestException;
import com.wefunding.core.exceptions.ErrorCode;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
@AllArgsConstructor
public class AccessTokenValidator {

  private final AccessTokenDecoder accessTokenDecoder;
  private final UserRepository userRepository;

  public Mono<User> validate(String accessToken) throws JsonProcessingException {
    AccessTokenPayload payload = this.accessTokenDecoder.decode(accessToken);
    UUID userId = UUID.fromString(payload.getUserId());
    return this.userRepository
        .findById(userId)
        .flatMap(
            user -> {
              if (!user.getFirebaseId().equals(payload.getFirebaseId())) {
                return Mono.error(new BadRequestException(ErrorCode.INVALID_ACCESS_TOKEN));
              }
              return Mono.just(user);
            })
        .switchIfEmpty(Mono.error(new BadRequestException(ErrorCode.USER_NOT_FOUND)));
  }
}
