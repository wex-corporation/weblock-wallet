package com.altech.core.utils;

import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Map;
import org.jose4j.jws.AlgorithmIdentifiers;
import org.jose4j.jws.JsonWebSignature;
import org.jose4j.jwt.JwtClaims;
import org.jose4j.jwt.consumer.InvalidJwtException;
import org.jose4j.jwt.consumer.JwtConsumer;
import org.jose4j.jwt.consumer.JwtConsumerBuilder;
import org.jose4j.lang.JoseException;

public class Jwk {

  private static final String ED25519 = "Ed25519";
  private static final String SHA256 = "SHA-256";
  private final PrivateKey privateKey;
  private final PublicKey publicKey;

  private Jwk(PrivateKey privateKey, PublicKey publicKey) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  public static Jwk of(String urlEncodedPrivateKey, String urlEncodedPublicKey) {
    try {
      KeyFactory keyFactory = KeyFactory.getInstance(ED25519);

      byte[] privateKeyBytes = Base64.getUrlDecoder().decode(urlEncodedPrivateKey);
      PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
      PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

      byte[] publicKeyBytes = Base64.getUrlDecoder().decode(urlEncodedPublicKey);
      X509EncodedKeySpec spec = new X509EncodedKeySpec(publicKeyBytes);
      PublicKey publicKey = keyFactory.generatePublic(spec);

      return new Jwk(privateKey, publicKey);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public String createJWT(Map<String, Object> claimsMap) {
    try {
      JwtClaims claims = new JwtClaims();
      claims.setGeneratedJwtId();
      claims.setIssuedAtToNow();
      claims.setNotBeforeMinutesInThePast(2);
      claims.setExpirationTimeMinutesInTheFuture(60); // 예를 들어 60분 후 만료

      claimsMap.forEach(claims::setClaim);

      JsonWebSignature jws = new JsonWebSignature();
      jws.setPayload(claims.toJson());
      jws.setKey(this.privateKey);
      jws.setKeyIdHeaderValue(this.generateKid());
      jws.setAlgorithmHeaderValue(AlgorithmIdentifiers.EDDSA);
      return jws.getCompactSerialization();
    } catch (JoseException e) {
      throw new RuntimeException("Error creating JWT", e);
    }
  }

  public boolean verifyTokenSignature(String jwt) {
    try {
      JwtConsumer jwtConsumer =
          new JwtConsumerBuilder()
              .setVerificationKey(this.publicKey)
              .setRelaxVerificationKeyValidation()
              .build();
      jwtConsumer.processToClaims(jwt);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  public JwtClaims resolveClaims(String token) {
    try {
      JwtConsumer jwtConsumer =
          new JwtConsumerBuilder()
              .setVerificationKey(publicKey)
              .setRelaxVerificationKeyValidation()
              .build();
      return jwtConsumer.processToClaims(token);
    } catch (InvalidJwtException e) {
      e.printStackTrace();
      throw new RuntimeException("Error parsing JWT", e);
    }
  }

  private String generateKid() {
    try {
      MessageDigest digest = MessageDigest.getInstance(SHA256);
      byte[] encodedhash = digest.digest(this.publicKey.getEncoded());
      return Base64.getUrlEncoder().encodeToString(encodedhash);
    } catch (NoSuchAlgorithmException e) {
      throw new RuntimeException("Unable to generate kid", e);
    }
  }
}
