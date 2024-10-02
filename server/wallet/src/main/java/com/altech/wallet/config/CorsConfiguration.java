package com.altech.wallet.config;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.cors.reactive.CorsUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Slf4j
@Configuration
public class CorsConfiguration {

  @Value("${spring.profiles.active}")
  String activeProfile;

  private static final String ALLOWED_METHODS = "GET, PUT, POST, PATCH, DELETE, OPTIONS";
  private static final String ALLOWED_HEADERS =
      "If-Modified-Since, Content-Type, Authorization, X-Al-Api-Key, X-Al-Org-Host";
  private static final String MAX_AGE = "3600";
  private static final String ALLOWED_CREDENTIALS = "true";
  private static final String EXPOSED_HEADERS = "X-Al-Access-Token";

  @Bean("corsWebFilter")
  public WebFilter corsWebFilter(CorsProperties corsProperties) {
    return (ServerWebExchange ctx, WebFilterChain chain) -> {
      ServerHttpRequest request = ctx.getRequest();
      // This should be popup(iframe) client urls
      String allowedOrigin =
          (this.activeProfile.equals("local") || this.activeProfile.equals("dev"))
              ? request.getHeaders().getOrigin()
              : this.findMatchingOrigin(ctx, corsProperties.getAllowedOrigins());

      if (CorsUtils.isCorsRequest(request)) {
        this.updateCorsHeaders(ctx, allowedOrigin);
        if (CorsUtils.isPreFlightRequest(request)) {
          ctx.getResponse().setStatusCode(HttpStatus.OK);
          return Mono.empty();
        }
      }

      return chain.filter(ctx);
    };
  }

  private String findMatchingOrigin(ServerWebExchange ctx, List<String> allowedOrigins) {
    String origin = ctx.getRequest().getHeaders().getOrigin();
    return allowedOrigins.stream()
        .filter(o -> o.equals(origin))
        .findFirst()
        .orElse(allowedOrigins.get(0));
  }

  private void updateCorsHeaders(ServerWebExchange ctx, String allowedOrigin) {
    HttpHeaders headers = ctx.getResponse().getHeaders();
    headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, allowedOrigin);
    headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, ALLOWED_METHODS);
    headers.set(HttpHeaders.ACCESS_CONTROL_MAX_AGE, MAX_AGE);
    headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, ALLOWED_HEADERS);
    headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, ALLOWED_CREDENTIALS);
    headers.set(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, EXPOSED_HEADERS);
  }
}
