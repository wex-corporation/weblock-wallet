package com.wefunding.wallet.config;

import com.wefunding.core.domain.organization.Organization;
import com.wefunding.core.domain.user.User;
import com.wefunding.core.exceptions.ErrorCode;
import com.wefunding.core.exceptions.InternalServerException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

@Component
@RequiredArgsConstructor
public class AttributeStorage {

  public static final String ORGANIZATION_ATTRIBUTE_KEY = "organization";
  public static final String USER_ATTRIBUTE_KEY = "user";

  public static Organization getOrganization(ServerWebExchange exchange) {
    Organization organization = exchange.getAttribute(ORGANIZATION_ATTRIBUTE_KEY);
    if (organization == null) {
      throw new InternalServerException(ErrorCode.ORGANIZATION_NOT_FOUND);
    }

    return organization;
  }

  public static User getUser(ServerWebExchange exchange) {
    User user = exchange.getAttribute(USER_ATTRIBUTE_KEY);
    if (user == null) {
      throw new InternalServerException(ErrorCode.USER_NOT_FOUND);
    }

    return user;
  }
}
//
