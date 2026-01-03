package com.cleany.infojobs.infrastructure.http.mapper;

import com.cleany.infojobs.domain.model.Candidate;
import com.cleany.infojobs.domain.model.JobApplication;
import com.cleany.infojobs.domain.model.Offer;
import com.cleany.infojobs.infrastructure.http.dto.CandidateRequest;
import com.cleany.infojobs.infrastructure.http.dto.JobApplicationResponse;
import com.cleany.infojobs.infrastructure.http.dto.OfferResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface HttpMapper {

    OfferResponse toOfferResponse(Offer offer);

    @Mapping(target = "status", expression = "java(application.getStatus().name())")
    JobApplicationResponse toJobApplicationResponse(JobApplication application);

    Candidate toCandidate(CandidateRequest request);
}
