package com.cleany.infojobs.infrastructure.infojobs;

import com.cleany.infojobs.config.InfoJobsProperties;
import com.cleany.infojobs.domain.model.ApplicationStatus;
import com.cleany.infojobs.domain.model.Candidate;
import com.cleany.infojobs.domain.model.JobApplication;
import com.cleany.infojobs.domain.model.Offer;
import com.cleany.infojobs.domain.model.OfferSource;
import com.cleany.infojobs.domain.port.InfoJobsGateway;
import com.cleany.infojobs.infrastructure.infojobs.dto.InfoJobsApplicationRequest;
import com.cleany.infojobs.infrastructure.infojobs.dto.InfoJobsApplicationResponse;
import com.cleany.infojobs.infrastructure.infojobs.dto.InfoJobsOfferResponse;
import com.cleany.infojobs.infrastructure.infojobs.dto.InfoJobsOffersResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;

@Component
public class InfoJobsGatewayAdapter implements InfoJobsGateway {

    private static final Logger log = LoggerFactory.getLogger(InfoJobsGatewayAdapter.class);

    private final WebClient webClient;
    private final InfoJobsProperties properties;

    public InfoJobsGatewayAdapter(@Qualifier("infoJobsWebClient") WebClient infoJobsWebClient, InfoJobsProperties properties) {
        this.webClient = infoJobsWebClient;
        this.properties = properties;
    }

    @Override
    public List<Offer> fetchOffers(String query, String location) {
        InfoJobsOffersResponse response = webClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path("/offers");
                    if (query != null && !query.isBlank()) {
                        builder.queryParam("q", query);
                    }
                    if (location != null && !location.isBlank()) {
                        builder.queryParam("location", location);
                    }
                    return builder.build();
                })
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(InfoJobsOffersResponse.class)
                .onErrorResume(ex -> {
                    log.error("Failed to fetch offers from InfoJobs", ex);
                    return Mono.just(new InfoJobsOffersResponse());
                })
                .block();

        if (response == null || response.getOffers() == null) {
            return List.of();
        }

        return response.getOffers().stream()
                .map(this::toDomainOffer)
                .toList();
    }

    @Override
    public JobApplication submitApplication(JobApplication application, Candidate candidate) {
        InfoJobsApplicationRequest request = new InfoJobsApplicationRequest(
                String.valueOf(application.getOfferId()),
                candidate.getFullName(),
                candidate.getEmail(),
                candidate.getPhone()
        );

        InfoJobsApplicationResponse response = webClient.post()
                .uri("/applications")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(InfoJobsApplicationResponse.class)
                .onErrorResume(ex -> {
                    log.error("Failed to submit application to InfoJobs", ex);
                    return Mono.just(new InfoJobsApplicationResponse());
                })
                .block();

        String externalId = response != null ? response.getApplicationId() : null;
        ApplicationStatus status = response != null && "SUBMITTED".equalsIgnoreCase(response.getStatus())
                ? ApplicationStatus.SUBMITTED
                : ApplicationStatus.FAILED;

        return application.withStatus(status, externalId);
    }

    private Offer toDomainOffer(InfoJobsOfferResponse response) {
        return new Offer(
                null,
                response.getId(),
                response.getTitle(),
                response.getDescription(),
                response.getCompany(),
                response.getLocation(),
                response.getPublishedAt() != null ? response.getPublishedAt() : Instant.now(),
                OfferSource.INFOJOBS
        );
    }
}
