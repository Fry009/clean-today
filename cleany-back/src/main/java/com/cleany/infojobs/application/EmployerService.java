package com.cleany.infojobs.application;

import com.cleany.infojobs.domain.model.EmployerApplication;
import com.cleany.infojobs.domain.model.EmployerOffer;
import com.cleany.infojobs.domain.port.EmployerGateway;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployerService {

    private final EmployerGateway employerGateway;

    public EmployerService(EmployerGateway employerGateway) {
        this.employerGateway = employerGateway;
    }

    public List<EmployerOffer> offers() {
        return employerGateway.fetchOffers();
    }

    public List<EmployerApplication> applications(String offerId) {
        return employerGateway.fetchApplications(offerId);
    }
}
