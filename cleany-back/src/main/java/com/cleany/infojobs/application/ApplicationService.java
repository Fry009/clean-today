package com.cleany.infojobs.application;

import com.cleany.infojobs.domain.model.ApplicationStatus;
import com.cleany.infojobs.domain.model.Candidate;
import com.cleany.infojobs.domain.model.JobApplication;
import com.cleany.infojobs.domain.model.Offer;
import com.cleany.infojobs.domain.port.CandidateRepository;
import com.cleany.infojobs.domain.port.InfoJobsGateway;
import com.cleany.infojobs.domain.port.JobApplicationRepository;
import com.cleany.infojobs.domain.port.OfferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ApplicationService {

    private final CandidateRepository candidateRepository;
    private final OfferRepository offerRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InfoJobsGateway infoJobsGateway;

    public ApplicationService(CandidateRepository candidateRepository,
                              OfferRepository offerRepository,
                              JobApplicationRepository jobApplicationRepository,
                              InfoJobsGateway infoJobsGateway) {
        this.candidateRepository = candidateRepository;
        this.offerRepository = offerRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.infoJobsGateway = infoJobsGateway;
    }

    @Transactional
    public JobApplication applyToOffer(String externalOfferId, Candidate candidate) {
        Offer offer = offerRepository.findByExternalId(externalOfferId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found: " + externalOfferId));

        Candidate persistedCandidate = candidateRepository.findByEmail(candidate.getEmail())
                .orElseGet(() -> candidateRepository.save(candidate));

        JobApplication application = new JobApplication(
                null,
                offer.getId(),
                persistedCandidate.getId(),
                ApplicationStatus.PENDING,
                null,
                Instant.now()
        );

        JobApplication saved = jobApplicationRepository.save(application);
        JobApplication submitted = infoJobsGateway.submitApplication(saved, persistedCandidate);
        return jobApplicationRepository.save(submitted);
    }

    public List<JobApplication> findAll() {
        return jobApplicationRepository.findAll();
    }
}
