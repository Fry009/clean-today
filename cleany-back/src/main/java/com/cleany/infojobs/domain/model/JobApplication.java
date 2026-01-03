package com.cleany.infojobs.domain.model;

import java.time.Instant;

public class JobApplication {
    private final Long id;
    private final Long offerId;
    private final Long candidateId;
    private final ApplicationStatus status;
    private final String externalApplicationId;
    private final Instant createdAt;

    public JobApplication(Long id, Long offerId, Long candidateId, ApplicationStatus status,
                          String externalApplicationId, Instant createdAt) {
        this.id = id;
        this.offerId = offerId;
        this.candidateId = candidateId;
        this.status = status;
        this.externalApplicationId = externalApplicationId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getOfferId() {
        return offerId;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public String getExternalApplicationId() {
        return externalApplicationId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public JobApplication withId(Long newId) {
        return new JobApplication(newId, offerId, candidateId, status, externalApplicationId, createdAt);
    }

    public JobApplication withStatus(ApplicationStatus newStatus, String externalId) {
        return new JobApplication(id, offerId, candidateId, newStatus, externalId, createdAt);
    }
}
