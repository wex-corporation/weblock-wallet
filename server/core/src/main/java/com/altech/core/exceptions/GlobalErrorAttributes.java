package com.altech.core.exceptions;

import java.util.Map;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.reactive.error.DefaultErrorAttributes;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.ServerRequest;

@Component
public class GlobalErrorAttributes extends DefaultErrorAttributes {

  @Override
  public Map<String, Object> getErrorAttributes(
      ServerRequest request, ErrorAttributeOptions options) {
    Map<String, Object> map = super.getErrorAttributes(request, options);

    Throwable throwable = getError(request);
    if (throwable instanceof GlobalResponseStatusException) {
      GlobalResponseStatusException ex = (GlobalResponseStatusException) getError(request);
      map.put("exception", ex.getClass().getSimpleName());
      map.put("status", ex.getHttpStatus().value());
      map.put("code", ex.getErrorCode().getCode());
      map.put("message", ex.getErrorCode().getMessage());
      map.put("detail", ex.getMessage());
      return map;
    }

    map.put("exception", "SystemDefaultException");
    map.put("message", throwable.getMessage());
    return map;
  }
}
