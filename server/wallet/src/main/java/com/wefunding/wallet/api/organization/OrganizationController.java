package com.wefunding.wallet.api.organization;

import com.wefunding.wallet.api.organization.dto.AddHostRequest;
import com.wefunding.wallet.api.organization.dto.CreateOrganizationRequest;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("v1/organizations")
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
public class OrganizationController {

  private final OrganizationService organizationService;

  @PostMapping
  public Mono<Void> createOrganization(@RequestBody final CreateOrganizationRequest request) {
    return this.organizationService.createOrganization(request);
  }

  @PatchMapping("/allowed-hosts")
  public Mono<Void> addAllowedHosts(
      ServerWebExchange exchange, @RequestBody final AddHostRequest request) {
    return this.organizationService.addAllowedHosts(exchange, request);
  }
}
