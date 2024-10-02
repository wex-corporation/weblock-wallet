package com.altech.wallet.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FirebaseConfig {

  @Value("${spring.cloud.gcp.credentials.encoded-key}")
  private String encodedKey;

  @PostConstruct
  public void initialize() {
    try {
      byte[] decodedKey = Base64.getDecoder().decode(this.encodedKey);
      InputStream credentialsStream = new ByteArrayInputStream(decodedKey);

      FirebaseOptions options =
          FirebaseOptions.builder()
              .setCredentials(GoogleCredentials.fromStream(credentialsStream))
              .build();

      FirebaseApp.initializeApp(options);
    } catch (IOException e) {
      throw new RuntimeException("Failed to initialize Firebase", e);
    }
  }
}
