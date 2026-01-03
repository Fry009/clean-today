package com.cleany.infojobs.infrastructure.http;

import com.cleany.infojobs.application.OfferService;
import com.cleany.infojobs.infrastructure.http.dto.OfferResponse;
import com.cleany.infojobs.infrastructure.http.mapper.HttpMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private final OfferService offerService;
    private final HttpMapper mapper;

    public OfferController(OfferService offerService, HttpMapper mapper) {
        this.offerService = offerService;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<List<OfferResponse>> list() {
        List<OfferResponse> offers = offerService.findAll().stream()
                .map(mapper::toOfferResponse)
                .toList();
        return ResponseEntity.ok(offers);
    }

    @PostMapping("/sync")
    public ResponseEntity<List<OfferResponse>> sync() {
        List<OfferResponse> offers = offerService.syncFromInfoJobs().stream()
                .map(mapper::toOfferResponse)
                .toList();
        return ResponseEntity.ok(offers);
    }
}
