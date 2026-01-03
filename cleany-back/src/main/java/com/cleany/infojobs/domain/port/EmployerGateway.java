package com.cleany.infojobs.domain.port;

import com.cleany.infojobs.domain.model.EmployerApplication;
import com.cleany.infojobs.domain.model.EmployerOffer;

import java.util.List;

public interface EmployerGateway {

    List<EmployerOffer> fetchOffers();

    List<EmployerApplication> fetchApplications(String offerId);
}
