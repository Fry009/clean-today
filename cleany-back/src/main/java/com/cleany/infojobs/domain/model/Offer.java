package com.cleany.infojobs.domain.model;

import java.time.Instant;
import java.util.Objects;

public class Offer {
    private final Long id;
    private final String externalId;
    private final String title;
    private final String description;
    private final String company;
    private final String location;
    private final Instant publishedAt;
    private final OfferSource source;

    public Offer(Long id, String externalId, String title, String description, String company, String location,
                 Instant publishedAt, OfferSource source) {
        this.id = id;
        this.externalId = externalId;
        this.title = title;
        this.description = description;
        this.company = company;
        this.location = location;
        this.publishedAt = publishedAt;
        this.source = source;
    }

    public Long getId() {
        return id;
    }

    public String getExternalId() {
        return externalId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCompany() {
        return company;
    }

    public String getLocation() {
        return location;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public OfferSource getSource() {
        return source;
    }

    public Offer withId(Long newId) {
        return new Offer(newId, externalId, title, description, company, location, publishedAt, source);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Offer offer)) return false;
        return Objects.equals(externalId, offer.externalId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(externalId);
    }
}
