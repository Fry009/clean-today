package com.cleany.infojobs.infrastructure.infojobs.dto;

import java.util.List;

public class InfoJobsOffersResponse {
    private List<InfoJobsOfferResponse> offers;

    public List<InfoJobsOfferResponse> getOffers() {
        return offers;
    }

    public void setOffers(List<InfoJobsOfferResponse> offers) {
        this.offers = offers;
    }
}
