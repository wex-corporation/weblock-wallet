package com.wefunding.wallet.config.filter;

import com.wefunding.core.domain.jwt.AccessTokenValidator;
import com.wefunding.core.domain.organization.OrganizationRepository;
import com.wefunding.wallet.config.filter.url.UserValidationExcludeFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.util.pattern.PathPatternParser;

@Configuration
public class FilterConfig {

  @Bean
  public AntPathMatcher antPathMatcher() {
    return new AntPathMatcher();
  }

  @Bean
  public PathPatternParser pathPatternParser() {
    return new PathPatternParser();
  }

  @Bean
  public UserValidationExcludeFilter userExcludeFilter(
      ObjectMapper objectMapper,
      PathPatternParser pathPatternParser,
      AccessTokenValidator accessTokenValidator,
      OrganizationRepository organizationRepository) {
    return new UserValidationExcludeFilter(
        objectMapper, pathPatternParser, accessTokenValidator, organizationRepository);
  }
}
