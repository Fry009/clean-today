package com.cleany.infojobs.infrastructure.http.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ApplicationRequest {
    @NotBlank
    private String externalOfferId;

    @Valid
    @NotNull
    private CandidateRequest candidate;

    public String getExternalOfferId() {
        return externalOfferId;
    }

    public void setExternalOfferId(String externalOfferId) {
        this.externalOfferId = externalOfferId;
    }

    public CandidateRequest getCandidate() {
        return candidate;
    }

    public void setCandidate(CandidateRequest candidate) {
        this.candidate = candidate;
    }
}
