package com.altech.core.domain.baseEntity;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Column;

@Getter
public abstract class DomainEntity {

  @Id
  @Column("id")
  private UUID id;

  @Column("created_at")
  @CreatedDate
  private LocalDateTime createdAt;

  @Column("updated_at")
  @LastModifiedDate
  private LocalDateTime updatedAt;

  @Column("deleted_at")
  private LocalDateTime deletedAt;

  public void delete() {
    this.deletedAt = LocalDateTime.now(ZoneId.of("UTC"));
  }
}
