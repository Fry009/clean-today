package com.cleany.infojobs.domain.port;

import com.cleany.infojobs.domain.model.JobApplication;
import com.cleany.infojobs.domain.model.Candidate;
import com.cleany.infojobs.domain.model.Offer;

import java.util.List;

public interface InfoJobsGateway {
    List<Offer> fetchOffers();

    JobApplication submitApplication(JobApplication application, Candidate candidate);
}
