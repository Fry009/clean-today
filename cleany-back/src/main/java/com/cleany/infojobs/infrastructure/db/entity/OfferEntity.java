package com.cleany.infojobs.infrastructure.db.entity;

import com.cleany.infojobs.domain.model.Offer;
import com.cleany.infojobs.domain.model.OfferSource;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "offers")
public class OfferEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_id", nullable = false, unique = true)
    private String externalId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String location;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferSource source;

    protected OfferEntity() {
    }

    public OfferEntity(Long id, String externalId, String title, String description, String company,
                       String location, Instant publishedAt, OfferSource source) {
        this.id = id;
        this.externalId = externalId;
        this.title = title;
        this.description = description;
        this.company = company;
        this.location = location;
        this.publishedAt = publishedAt;
        this.source = source;
    }

    public static OfferEntity fromDomain(Offer offer) {
        return new OfferEntity(
                offer.getId(),
                offer.getExternalId(),
                offer.getTitle(),
                offer.getDescription(),
                offer.getCompany(),
                offer.getLocation(),
                offer.getPublishedAt(),
                offer.getSource()
        );
    }

    public Offer toDomain() {
        return new Offer(id, externalId, title, description, company, location, publishedAt, source);
    }

    public Long getId() {
        return id;
    }

    public String getExternalId() {
        return externalId;
    }
}
