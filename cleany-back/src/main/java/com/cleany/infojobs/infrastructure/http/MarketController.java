package com.cleany.infojobs.infrastructure.http;

import com.cleany.infojobs.domain.port.InfoJobsGateway;
import com.cleany.infojobs.infrastructure.http.dto.MarketOfferResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    private final InfoJobsGateway infoJobsGateway;

    public MarketController(InfoJobsGateway infoJobsGateway) {
        this.infoJobsGateway = infoJobsGateway;
    }

    @GetMapping("/search")
    public ResponseEntity<List<MarketOfferResponse>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String location
    ) {
        var offers = infoJobsGateway.fetchOffers(query, location);
        var response = offers.stream().map(offer -> {
            MarketOfferResponse dto = new MarketOfferResponse();
            dto.setExternalId(offer.getExternalId());
            dto.setTitle(offer.getTitle());
            dto.setDescription(offer.getDescription());
            dto.setCompany(offer.getCompany());
            dto.setLocation(offer.getLocation());
            dto.setPublishedAt(offer.getPublishedAt());
            String encodedTitle = URLEncoder.encode(offer.getTitle(), StandardCharsets.UTF_8);
            dto.setOutboundUrl("https://www.infojobs.net/?q=" + encodedTitle);
            return dto;
        }).toList();
        return ResponseEntity.ok(response);
    }
}
