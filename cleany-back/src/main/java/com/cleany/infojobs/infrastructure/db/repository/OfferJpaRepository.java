package com.cleany.infojobs.infrastructure.db.repository;

import com.cleany.infojobs.infrastructure.db.entity.OfferEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OfferJpaRepository extends JpaRepository<OfferEntity, Long> {
    Optional<OfferEntity> findByExternalId(String externalId);
}
