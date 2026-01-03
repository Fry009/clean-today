package com.cleany.infojobs.e2e;

import com.cleany.infojobs.infrastructure.http.dto.ApplicationRequest;
import com.cleany.infojobs.infrastructure.http.dto.CandidateRequest;
import com.cleany.infojobs.infrastructure.http.dto.JobApplicationResponse;
import com.cleany.infojobs.infrastructure.http.dto.OfferResponse;
import com.github.tomakehurst.wiremock.WireMockServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.resetAllRequests;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class InfoJobsE2ETest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    static WireMockServer wireMockServer = new WireMockServer(
            com.github.tomakehurst.wiremock.core.WireMockConfiguration.options().dynamicPort()
    );

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        postgres.start();
        wireMockServer.start();
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        registry.add("infojobs.base-url", wireMockServer::baseUrl);
    }

    @Autowired
    TestRestTemplate restTemplate;

    @BeforeEach
    void setup() {
        resetAllRequests();
        stubOffers();
        stubApplications();
    }

    private void stubOffers() {
        String payload = """
                {
                  "offers": [
                    {
                      "id": "EXT-1",
                      "title": "Backend Sr",
                      "description": "Java/Spring",
                      "company": "InfoJobs",
                      "location": "Remote",
                      "publishedAt": "%s"
                    }
                  ]
                }
                """.formatted(Instant.now());

        stubFor(get(urlEqualTo("/offers"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(payload)));
    }

    private void stubApplications() {
        stubFor(post(urlEqualTo("/applications"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"applicationId\":\"APP-123\",\"status\":\"SUBMITTED\"}")));
    }

    @Test
    void shouldSyncOffersAndApply() {
        ResponseEntity<OfferResponse[]> syncResponse = restTemplate.postForEntity("/api/offers/sync", null, OfferResponse[].class);

        assertThat(syncResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(syncResponse.getBody()).isNotEmpty();
        String externalOfferId = syncResponse.getBody()[0].getExternalId();

        ApplicationRequest request = new ApplicationRequest();
        request.setExternalOfferId(externalOfferId);
        CandidateRequest candidateRequest = new CandidateRequest();
        candidateRequest.setFullName("John Doe");
        candidateRequest.setEmail("john@example.com");
        candidateRequest.setPhone("123456789");
        request.setCandidate(candidateRequest);

        ResponseEntity<JobApplicationResponse> applyResponse = restTemplate.postForEntity(
                "/api/applications",
                request,
                JobApplicationResponse.class
        );

        assertThat(applyResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(applyResponse.getBody()).isNotNull();
        assertThat(applyResponse.getBody().getStatus()).isEqualTo("SUBMITTED");
        assertThat(applyResponse.getBody().getExternalApplicationId()).isEqualTo("APP-123");
    }

    @AfterAll
    static void tearDown() {
        wireMockServer.stop();
        postgres.stop();
    }
}
