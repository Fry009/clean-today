package com.cleany.infojobs.infrastructure.db.adapter;

import com.cleany.infojobs.domain.model.Candidate;
import com.cleany.infojobs.domain.port.CandidateRepository;
import com.cleany.infojobs.infrastructure.db.entity.CandidateEntity;
import com.cleany.infojobs.infrastructure.db.repository.CandidateJpaRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CandidateRepositoryAdapter implements CandidateRepository {

    private final CandidateJpaRepository repository;

    public CandidateRepositoryAdapter(CandidateJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Candidate save(Candidate candidate) {
        CandidateEntity saved = repository.save(CandidateEntity.fromDomain(candidate));
        return saved.toDomain();
    }

    @Override
    public Optional<Candidate> findByEmail(String email) {
        return repository.findByEmail(email).map(CandidateEntity::toDomain);
    }
}
