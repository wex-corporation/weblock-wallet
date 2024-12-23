package com.wefunding.wallet.config.filter.url;

import com.wefunding.wallet.config.filter.FilterProperties.ApiPattern;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UrlFilter extends WebFilter {

  Flux<ApiPattern> getFilteredApis();

  Mono<Boolean> executeFilter(ServerWebExchange exchange);
}
