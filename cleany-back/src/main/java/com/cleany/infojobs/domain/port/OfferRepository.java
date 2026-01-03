package com.cleany.infojobs.domain.port;

import com.cleany.infojobs.domain.model.Offer;

import java.util.List;
import java.util.Optional;

public interface OfferRepository {
    Offer save(Offer offer);

    Optional<Offer> findByExternalId(String externalId);

    List<Offer> findAll();
}
