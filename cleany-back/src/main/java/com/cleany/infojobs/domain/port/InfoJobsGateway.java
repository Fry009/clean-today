package com.cleany.infojobs.domain.port;

import com.cleany.infojobs.domain.model.JobApplication;
import com.cleany.infojobs.domain.model.Candidate;
import com.cleany.infojobs.domain.model.Offer;

import java.util.List;

public interface InfoJobsGateway {
    default List<Offer> fetchOffers() {
        return fetchOffers(null, null);
    }

    List<Offer> fetchOffers(String query, String location);

    JobApplication submitApplication(JobApplication application, Candidate candidate);
}
