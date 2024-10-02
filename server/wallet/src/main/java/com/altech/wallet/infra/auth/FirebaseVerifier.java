package com.altech.wallet.infra.auth;

import com.altech.core.exceptions.BadRequestException;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class FirebaseVerifier {

  public Mono<Boolean> verify(String firebaseId, String idToken) {
    return Mono.fromCallable(() -> FirebaseAuth.getInstance().verifyIdToken(idToken))
        .map(decodedToken -> firebaseId.equals(decodedToken.getUid()))
        .onErrorResume(
            e -> Mono.error(new BadRequestException("Firebase ID token verification failed", e)));
  }
}
