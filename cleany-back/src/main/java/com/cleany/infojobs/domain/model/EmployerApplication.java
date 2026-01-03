package com.cleany.infojobs.domain.model;

public class EmployerApplication {
    private final String id;
    private final String candidateName;
    private final String status;
    private final String offerId;

    public EmployerApplication(String id, String candidateName, String status, String offerId) {
        this.id = id;
        this.candidateName = candidateName;
        this.status = status;
        this.offerId = offerId;
    }

    public String getId() {
        return id;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public String getStatus() {
        return status;
    }

    public String getOfferId() {
        return offerId;
    }
}
