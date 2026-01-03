package com.cleany.infojobs.domain.port;

import com.cleany.infojobs.domain.model.Candidate;

import java.util.Optional;

public interface CandidateRepository {
    Candidate save(Candidate candidate);

    Optional<Candidate> findByEmail(String email);
}
