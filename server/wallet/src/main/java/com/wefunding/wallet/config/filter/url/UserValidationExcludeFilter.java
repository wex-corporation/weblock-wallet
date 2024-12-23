package com.wefunding.wallet.config.filter.url;

import com.wefunding.core.domain.jwt.AccessTokenValidator;
import com.wefunding.core.domain.organization.OrganizationRepository;
import com.wefunding.core.exceptions.AuthorizationException;
import com.wefunding.core.exceptions.ErrorCode;
import com.wefunding.core.exceptions.InternalServerException;
import com.wefunding.core.exceptions.JWTException;
import com.wefunding.wallet.config.AttributeStorage;
import com.wefunding.wallet.config.filter.FilterProperties;
import com.wefunding.wallet.config.filter.FilterProperties.ApiPattern;
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
    if (apiKeyHeader == null
        || orgHostHeader == null
        || authorizationHeader == null
        || !authorizationHeader.startsWith("Bearer ")) {
      return this.sendErrorResponse(
              exchange,
              HttpStatus.UNAUTHORIZED,
              ErrorCode.AUTHORIZATION_HEADER_NOT_FOUND.getMessage())
          .thenReturn(false);
    }
    String token = authorizationHeader.substring(7);
    return this.organizationRepository
        .findByApiKey(apiKeyHeader)
        .flatMap(
            org -> {
              if (!org.getAllowedHosts().contains(orgHostHeader)) {
                return Mono.error(new AuthorizationException(ErrorCode.NOT_ALLOWED_HOST));
              }
              exchange.getAttributes().put(AttributeStorage.ORGANIZATION_ATTRIBUTE_KEY, org);
              try {
                return this.accessTokenValidator
                    .validate(token)
                    .doOnError(Throwable::printStackTrace)
                    .flatMap(
                        user -> {
                          if (!user.getOrgId().equals(org.getId())) {
                            return Mono.error(
                                new AuthorizationException(
                                    String.format(
                                        "User not registered on org id '%s'", org.getId()),
                                    ErrorCode.USER_NOT_FOUND));
                          }
                          exchange.getAttributes().put(AttributeStorage.USER_ATTRIBUTE_KEY, user);
                          return Mono.just(true);
                        })
                    .switchIfEmpty(
                        Mono.error(new AuthorizationException(ErrorCode.USER_NOT_FOUND)));
              } catch (JsonProcessingException e) {
                return Mono.error(new InternalServerException(e.getMessage()));
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
                return this.sendErrorResponse(exchange, HttpStatus.UNAUTHORIZED, e.getMessage())
                    .thenReturn(false);
              } else {
                return Mono.error(e);
              }
            })
        .onErrorResume(
            InternalServerException.class,
            e ->
                this.sendErrorResponse(exchange, HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage())
                    .thenReturn(false))
        .onErrorResume(
            e ->
                this.sendErrorResponse(
                        exchange, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error")
                    .thenReturn(false));
  }
}
