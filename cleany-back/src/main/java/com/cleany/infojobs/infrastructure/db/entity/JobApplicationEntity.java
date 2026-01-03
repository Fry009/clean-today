package com.cleany.infojobs.infrastructure.db.entity;

import com.cleany.infojobs.domain.model.ApplicationStatus;
import com.cleany.infojobs.domain.model.JobApplication;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "job_applications")
public class JobApplicationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "offer_id", nullable = false)
    private Long offerId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    @Column(name = "external_application_id")
    private String externalApplicationId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected JobApplicationEntity() {
    }

    public JobApplicationEntity(Long id, Long offerId, Long candidateId, ApplicationStatus status,
                                String externalApplicationId, Instant createdAt) {
        this.id = id;
        this.offerId = offerId;
        this.candidateId = candidateId;
        this.status = status;
        this.externalApplicationId = externalApplicationId;
        this.createdAt = createdAt;
    }

    public static JobApplicationEntity fromDomain(JobApplication application) {
        return new JobApplicationEntity(
                application.getId(),
                application.getOfferId(),
                application.getCandidateId(),
                application.getStatus(),
                application.getExternalApplicationId(),
                application.getCreatedAt()
        );
    }

    public JobApplication toDomain() {
        return new JobApplication(id, offerId, candidateId, status, externalApplicationId, createdAt);
    }

    public Long getId() {
        return id;
    }
}
