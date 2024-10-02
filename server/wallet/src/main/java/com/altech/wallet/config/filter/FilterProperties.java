package com.altech.wallet.config.filter;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = FilterProperties.FILTER_PROPERTIES_PREFIX)
public class FilterProperties {

  public static final String FILTER_PROPERTIES_PREFIX = "app.filters";

  private List<ApiPattern> userValidationExcludeApis = new ArrayList<>();

  public static List<ApiPattern> USER_VALIDATION_EXCLUDE_APIS;

  @PostConstruct
  public void updateStatic() {
    USER_VALIDATION_EXCLUDE_APIS = this.userValidationExcludeApis;
  }

  @Getter
  @Setter
  @NoArgsConstructor(access = AccessLevel.PROTECTED)
  @AllArgsConstructor
  public static class ApiPattern {

    private String path;
    private String method;
  }
}
