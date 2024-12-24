package com.wefunding.wallet.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

@Configuration
public class FirebaseConfig {

  @Value("${firebase.sdk.path}")
  private String sdkPath;

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
    Resource resource = new ClassPathResource(sdkPath);
    if (resource.exists()) {
      return resource.getInputStream();
    }
    throw new RuntimeException("firebase 키가 존재하지 않습니다.");
  }
}
