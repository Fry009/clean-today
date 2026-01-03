package com.cleany.infojobs.infrastructure.http.dto;

public class EmployerOfferResponse {
    private String id;
    private String title;
    private int applications;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getApplications() {
        return applications;
    }

    public void setApplications(int applications) {
        this.applications = applications;
    }
}
