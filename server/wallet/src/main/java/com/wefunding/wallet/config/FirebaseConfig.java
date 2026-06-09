package com.wefunding.wallet.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;

@Configuration
public class FirebaseConfig {

  @Value("${firebase.sdk.path:}")
  private String sdkPath;

  // Same service-account credential as spring-cloud-gcp. Lets Firebase load from
  // the injected secret (base64 JSON) with no credential file in the image.
  @Value("${spring.cloud.gcp.credentials.encoded-key:}")
  private String encodedKey;

  @PostConstruct
  public void initialize() {
    try {
      FirebaseOptions options =
          FirebaseOptions.builder()
              .setCredentials(GoogleCredentials.fromStream(getFirebaseInfo()))
              .build();

      FirebaseApp.initializeApp(options);
    } catch (IOException e) {
      throw new RuntimeException("Failed to initialize Firebase", e);
    }
  }

  private InputStream getFirebaseInfo() throws IOException {
    // 1) A resource path: "classpath:" (default), "file:" (mounted secret), or a bare path.
    if (sdkPath != null && !sdkPath.isBlank()) {
      Resource resource = new DefaultResourceLoader().getResource(sdkPath);
      if (resource.exists()) {
        return resource.getInputStream();
      }
    }
    // 2) Fallback: the base64-encoded service-account JSON from the injected secret.
    if (encodedKey != null && !encodedKey.isBlank()) {
      return new ByteArrayInputStream(
          Base64.getDecoder().decode(encodedKey.getBytes(StandardCharsets.UTF_8)));
    }
    throw new RuntimeException("firebase 키가 존재하지 않습니다.");
  }
}
