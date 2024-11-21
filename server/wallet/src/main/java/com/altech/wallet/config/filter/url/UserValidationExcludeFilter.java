package com.altech.wallet.config.filter.url;

import com.altech.core.domain.jwt.AccessTokenValidator;
import com.altech.core.domain.organization.OrganizationRepository;
import com.altech.core.exceptions.AuthorizationException;
import com.altech.core.exceptions.ErrorCode;
import com.altech.core.exceptions.JWTException;
import com.altech.wallet.config.AttributeStorage;
import com.altech.wallet.config.filter.FilterProperties;
import com.altech.wallet.config.filter.FilterProperties.ApiPattern;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.util.pattern.PathPatternParser;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
public class UserValidationExcludeFilter extends ExcludeUrlFilter {

  private final AccessTokenValidator accessTokenValidator;
  private final OrganizationRepository organizationRepository;

  public UserValidationExcludeFilter(
      ObjectMapper objectMapper,
      PathPatternParser pathPatternParser,
      AccessTokenValidator accessTokenValidator,
      OrganizationRepository organizationRepository) {
    super(objectMapper, pathPatternParser);
    this.accessTokenValidator = accessTokenValidator;
    this.organizationRepository = organizationRepository;
  }

  @Override
  public Flux<ApiPattern> getFilteredApis() {
    return Flux.fromIterable(FilterProperties.USER_VALIDATION_EXCLUDE_APIS);
  }

  @Override
  public Mono<Boolean> executeFilter(ServerWebExchange exchange) {
    String apiKeyHeader = exchange.getRequest().getHeaders().getFirst("X-Al-Api-Key");
    String orgHostHeader = exchange.getRequest().getHeaders().getFirst("X-Al-Org-Host");
    String authorizationHeader =
        exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

    log.debug(
        "Processing request - API Key: {}, Org Host: {}, Authorization: {}",
        apiKeyHeader,
        orgHostHeader,
        authorizationHeader);

    if (apiKeyHeader == null
        || orgHostHeader == null
        || authorizationHeader == null
        || !authorizationHeader.startsWith("Bearer ")) {
      log.warn(
          "Invalid or missing headers. API Key: {}, Org Host: {}, Authorization: {}",
          apiKeyHeader,
          orgHostHeader,
          authorizationHeader);
      return this.sendErrorResponse(
              exchange,
              HttpStatus.UNAUTHORIZED,
              ErrorCode.AUTHORIZATION_HEADER_NOT_FOUND.getMessage())
          .thenReturn(false);
    }

    String token = authorizationHeader.substring(7);
    log.debug("Extracted token from authorization header: {}", token);

    return this.organizationRepository
        .findByApiKey(apiKeyHeader)
        .doOnNext(org -> log.debug("Found organization for API Key: {}", org))
        .flatMap(
            org -> {
              if (!org.getAllowedHosts().contains(orgHostHeader)) {
                log.warn(
                    "Org Host '{}' not allowed for organization '{}'",
                    orgHostHeader,
                    org.getName());
                return Mono.error(new AuthorizationException(ErrorCode.NOT_ALLOWED_HOST));
              }

              exchange.getAttributes().put(AttributeStorage.ORGANIZATION_ATTRIBUTE_KEY, org);
              log.debug("Organization stored in attributes: {}", org);

              try {
                return this.accessTokenValidator
                    .validate(token)
                    .doOnNext(user -> log.debug("Validated user: {}", user))
                    .flatMap(
                        user -> {
                          if (!user.getOrgId().equals(org.getId())) {
                            log.warn(
                                "User '{}' not associated with organization '{}'",
                                user.getId(),
                                org.getId());
                            return Mono.error(new AuthorizationException(ErrorCode.USER_NOT_FOUND));
                          }
                          exchange.getAttributes().put(AttributeStorage.USER_ATTRIBUTE_KEY, user);
                          log.debug("User stored in attributes: {}", user);
                          return Mono.just(true);
                        });
              } catch (JsonProcessingException e) {
                log.error("Error processing JSON: {}", e.getMessage());
                return this.sendErrorResponse(
                        exchange, HttpStatus.INTERNAL_SERVER_ERROR, "Error processing JSON")
                    .thenReturn(false);
              }
            })
        .switchIfEmpty(
            Mono.error(
                new AuthorizationException(
                    "No organization found with provided API key",
                    ErrorCode.ORGANIZATION_NOT_FOUND)))
        .onErrorResume(
            e -> {
              if (e instanceof JWTException || e instanceof AuthorizationException) {
                log.error("Authorization error: {}", e.getMessage());
                return this.sendErrorResponse(exchange, HttpStatus.UNAUTHORIZED, e.getMessage())
                    .thenReturn(false);
              } else {
                log.error("Unhandled error during filter execution: {}", e.getMessage());
                return Mono.error(e);
              }
            });
  }
}
