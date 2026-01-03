package com.cleany.infojobs.infrastructure.db.repository;

import com.cleany.infojobs.infrastructure.db.entity.JobApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationJpaRepository extends JpaRepository<JobApplicationEntity, Long> {
}
