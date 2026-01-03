package com.cleany.infojobs.infrastructure.http;

import com.cleany.infojobs.application.EmployerService;
import com.cleany.infojobs.infrastructure.http.dto.EmployerApplicationResponse;
import com.cleany.infojobs.infrastructure.http.dto.EmployerOfferResponse;
import com.cleany.infojobs.infrastructure.http.mapper.HttpMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/employers")
public class EmployerController {

    private final EmployerService employerService;
    private final HttpMapper mapper;

    public EmployerController(EmployerService employerService, HttpMapper mapper) {
        this.employerService = employerService;
        this.mapper = mapper;
    }

    @GetMapping("/offers")
    public ResponseEntity<List<EmployerOfferResponse>> offers() {
        var offers = employerService.offers();
        return ResponseEntity.ok(mapper.toEmployerOfferResponse(offers));
    }

    @GetMapping("/offers/{offerId}/applications")
    public ResponseEntity<List<EmployerApplicationResponse>> applications(@PathVariable String offerId) {
        var apps = employerService.applications(offerId);
        return ResponseEntity.ok(mapper.toEmployerApplicationResponse(apps));
    }
}
