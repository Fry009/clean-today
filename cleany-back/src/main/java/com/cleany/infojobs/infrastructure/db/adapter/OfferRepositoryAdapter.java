package com.cleany.infojobs.infrastructure.db.adapter;

import com.cleany.infojobs.domain.model.Offer;
import com.cleany.infojobs.domain.port.OfferRepository;
import com.cleany.infojobs.infrastructure.db.entity.OfferEntity;
import com.cleany.infojobs.infrastructure.db.repository.OfferJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class OfferRepositoryAdapter implements OfferRepository {

    private final OfferJpaRepository repository;

    public OfferRepositoryAdapter(OfferJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Offer save(Offer offer) {
        OfferEntity entity = OfferEntity.fromDomain(offer);
        OfferEntity saved = repository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<Offer> findByExternalId(String externalId) {
        return repository.findByExternalId(externalId).map(OfferEntity::toDomain);
    }

    @Override
    public List<Offer> findAll() {
        return repository.findAll().stream().map(OfferEntity::toDomain).toList();
    }
}
