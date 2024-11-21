package com.altech.wallet.api.organization;

import com.altech.core.domain.organization.Organization;
import com.altech.core.domain.organization.OrganizationRepository;
import com.altech.wallet.api.organization.dto.AddHostRequest;
import com.altech.wallet.api.organization.dto.CreateOrganizationRequest;
import com.altech.wallet.config.AttributeStorage;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Service
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class OrganizationService {

  private final OrganizationRepository organizationRepository;

  @Transactional
  public Mono<Void> createOrganization(CreateOrganizationRequest request) {
    return this.organizationRepository
        .save(Organization.create(request.name(), request.apiKey()))
        .flatMap(
            org -> {
              List<String> defaultAllowedHosts =
                  List.of("http://localhost:3000", "http://localhost:3333");
              org.setAllowedHosts(defaultAllowedHosts);
              return this.organizationRepository.save(org);
            })
        .then();
  }

  @Transactional
  public Mono<Void> addAllowedHosts(ServerWebExchange exchange, AddHostRequest request) {
    return Mono.just(AttributeStorage.getOrganization(exchange))
        .doOnNext(org -> org.addAllowedHost(request.hostname()))
        .flatMap(this.organizationRepository::save)
        .then();
  }
}
