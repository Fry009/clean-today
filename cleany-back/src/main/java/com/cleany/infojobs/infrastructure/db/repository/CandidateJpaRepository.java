package com.cleany.infojobs.infrastructure.db.repository;

import com.cleany.infojobs.infrastructure.db.entity.CandidateEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CandidateJpaRepository extends JpaRepository<CandidateEntity, Long> {
    Optional<CandidateEntity> findByEmail(String email);
}
