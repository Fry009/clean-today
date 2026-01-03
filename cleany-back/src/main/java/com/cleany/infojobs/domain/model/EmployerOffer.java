package com.cleany.infojobs.domain.model;

public class EmployerOffer {
    private final String id;
    private final String title;
    private final int applications;

    public EmployerOffer(String id, String title, int applications) {
        this.id = id;
        this.title = title;
        this.applications = applications;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public int getApplications() {
        return applications;
    }
}
