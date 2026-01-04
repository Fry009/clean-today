package com.cleany.infojobs.infrastructure.http.dto;

import java.time.Instant;

public class MarketOfferResponse {
    private String externalId;
    private String title;
    private String description;
    private String company;
    private String location;
    private Instant publishedAt;
    private String outboundUrl;

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }

    public String getOutboundUrl() {
        return outboundUrl;
    }

    public void setOutboundUrl(String outboundUrl) {
        this.outboundUrl = outboundUrl;
    }
}
