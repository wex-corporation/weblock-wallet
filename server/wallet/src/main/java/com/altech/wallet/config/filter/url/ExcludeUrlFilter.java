package com.altech.wallet.config.filter.url;

import com.altech.core.exceptions.ErrorCode;
import com.altech.core.exceptions.InternalServerException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import org.springframework.web.util.pattern.PathPatternParser;
import reactor.core.publisher.Mono;

@Slf4j
public abstract class ExcludeUrlFilter implements UrlFilter {

  private final ObjectMapper objectMapper;
  private final PathPatternParser pathPatternParser;

  protected ExcludeUrlFilter(ObjectMapper objectMapper, PathPatternParser pathPatternParser) {
    this.objectMapper = objectMapper;
    this.pathPatternParser = pathPatternParser;
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    String requestMethod = exchange.getRequest().getMethod().name();
    return this.getFilteredApis()
        .any(
            pattern -> {
              return this.pathPatternParser
                      .parse(pattern.getPath())
                      .matches(exchange.getRequest().getPath())
                  && (pattern.getMethod() == null
                      || pattern.getMethod().equalsIgnoreCase(requestMethod));
            })
        .flatMap(
            matchFound -> {
              return matchFound
                  ? chain.filter(exchange)
                  : executeFilter(exchange)
                      .flatMap(
                          shouldContinue -> shouldContinue ? chain.filter(exchange) : Mono.empty());
            });
  }

  protected Mono<Void> sendErrorResponse(
      ServerWebExchange exchange, HttpStatus status, String errorMessage) {
    exchange.getResponse().setStatusCode(status);
    exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
    try {
      return exchange
          .getResponse()
          .writeWith(
              Mono.just(
                  exchange
                      .getResponse()
                      .bufferFactory()
                      .wrap(
                          this.objectMapper.writeValueAsBytes(
                              FilterErrorResponse.of(status.value(), errorMessage)))));
    } catch (JsonProcessingException e) {
      throw new InternalServerException(ErrorCode.UNKNOWN_ERROR);
    }
  }
}
