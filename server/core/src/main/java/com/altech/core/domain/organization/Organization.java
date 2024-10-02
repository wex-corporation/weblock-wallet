package com.altech.core.domain.organization;

import com.altech.core.domain.baseEntity.DomainEntity;
import java.util.Arrays;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Slf4j
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Table("organizations")
public class Organization extends DomainEntity {

  private String name;

  /**
   * This is public key base64 encoded from RSA 2048 key pair. Should be generated on front, and
   * never pass private key to backend.
   */
  @Column("api_key")
  private String apiKey;

  @Column("allowed_hosts")
  private String allowedHosts;

  public static Organization create(String name, String apiKey) {
    return new Organization(name, apiKey, "");
  }

  private static final String DELIMITER = ",";

  public List<String> getAllowedHosts() {
    return Arrays.asList(this.allowedHosts.split(DELIMITER));
  }

  public void setAllowedHosts(List<String> allowedHosts) {
    this.allowedHosts = String.join(DELIMITER, allowedHosts);
  }

  public void addAllowedHost(String origin) {
    List<String> origins = this.getAllowedHosts();
    if (!origins.contains(origin)) {
      origins.add(origin);
      this.setAllowedHosts(origins);
    }
  }

  public void removeAllowedHost(String origin) {
    List<String> origins = this.getAllowedHosts();
    if (origins.remove(origin)) {
      this.setAllowedHosts(origins);
    }
  }
}
