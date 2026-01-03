package com.cleany.infojobs.application;

import com.cleany.infojobs.domain.model.Offer;
import com.cleany.infojobs.domain.port.InfoJobsGateway;
import com.cleany.infojobs.domain.port.OfferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final InfoJobsGateway infoJobsGateway;

    public OfferService(OfferRepository offerRepository, InfoJobsGateway infoJobsGateway) {
        this.offerRepository = offerRepository;
        this.infoJobsGateway = infoJobsGateway;
    }

    public List<Offer> findAll() {
        return offerRepository.findAll();
    }

    @Transactional
    public List<Offer> syncFromInfoJobs() {
        List<Offer> remote = infoJobsGateway.fetchOffers();
        for (Offer offer : remote) {
            offerRepository.findByExternalId(offer.getExternalId())
                    .orElseGet(() -> offerRepository.save(offer));
        }
        return offerRepository.findAll();
    }
}
