package com.cleany.infojobs.infrastructure.db.adapter;

import com.cleany.infojobs.domain.model.JobApplication;
import com.cleany.infojobs.domain.port.JobApplicationRepository;
import com.cleany.infojobs.infrastructure.db.entity.JobApplicationEntity;
import com.cleany.infojobs.infrastructure.db.repository.JobApplicationJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JobApplicationRepositoryAdapter implements JobApplicationRepository {

    private final JobApplicationJpaRepository repository;

    public JobApplicationRepositoryAdapter(JobApplicationJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public JobApplication save(JobApplication application) {
        JobApplicationEntity saved = repository.save(JobApplicationEntity.fromDomain(application));
        return saved.toDomain();
    }

    @Override
    public List<JobApplication> findAll() {
        return repository.findAll().stream().map(JobApplicationEntity::toDomain).toList();
    }
}
