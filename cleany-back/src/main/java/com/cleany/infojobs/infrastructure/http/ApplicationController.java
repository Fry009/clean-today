package com.cleany.infojobs.infrastructure.http;

import com.cleany.infojobs.application.ApplicationService;
import com.cleany.infojobs.infrastructure.http.dto.ApplicationRequest;
import com.cleany.infojobs.infrastructure.http.dto.JobApplicationResponse;
import com.cleany.infojobs.infrastructure.http.mapper.HttpMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final HttpMapper mapper;

    public ApplicationController(ApplicationService applicationService, HttpMapper mapper) {
        this.applicationService = applicationService;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<JobApplicationResponse> apply(@Valid @RequestBody ApplicationRequest request) {
        var candidate = mapper.toCandidate(request.getCandidate());
        var application = applicationService.applyToOffer(request.getExternalOfferId(), candidate);
        return ResponseEntity.ok(mapper.toJobApplicationResponse(application));
    }
}
