package com.cleany.infojobs.e2e;

import com.cleany.infojobs.infrastructure.http.dto.EmployerApplicationResponse;
import com.cleany.infojobs.infrastructure.http.dto.EmployerOfferResponse;
import com.github.tomakehurst.wiremock.WireMockServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Arrays;
import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.resetAllRequests;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class InfoJobsEmployerE2ETest {

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
        registry.add("infojobs.employer-base-url", wireMockServer::baseUrl);
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
                <OffersResponse>
                  <offers>
                    <offer>
                      <id>OF-1</id>
                      <title>Backend Engineer</title>
                      <applications>3</applications>
                    </offer>
                    <offer>
                      <id>OF-2</id>
                      <title>Frontend</title>
                      <applications>1</applications>
                    </offer>
                  </offers>
                </OffersResponse>
                """;

        stubFor(post(urlEqualTo("/employer/offers"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader(HttpHeaders.CONTENT_TYPE, "text/xml")
                        .withBody(payload)));
    }

    private void stubApplications() {
        String payload = """
                <ApplicationsResponse>
                  <applications>
                    <application>
                      <id>APP-1</id>
                      <candidateName>Jane Doe</candidateName>
                      <status>RECEIVED</status>
                    </application>
                    <application>
                      <id>APP-2</id>
                      <candidateName>John Doe</candidateName>
                      <status>IN_REVIEW</status>
                    </application>
                  </applications>
                </ApplicationsResponse>
                """;

        stubFor(post(urlEqualTo("/employer/applications"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader(HttpHeaders.CONTENT_TYPE, "text/xml")
                        .withBody(payload)));
    }

    @Test
    void shouldFetchEmployerOffersAndApplications() {
        ResponseEntity<EmployerOfferResponse[]> offersResponse = restTemplate.getForEntity(
                "/api/employers/offers",
                EmployerOfferResponse[].class
        );

        assertThat(offersResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<EmployerOfferResponse> offers = Arrays.asList(offersResponse.getBody());
        assertThat(offers).hasSize(2);
        assertThat(offers.get(0).getApplications()).isEqualTo(3);

        ResponseEntity<EmployerApplicationResponse[]> appsResponse = restTemplate.exchange(
                "/api/employers/offers/{offerId}/applications",
                HttpMethod.GET,
                HttpEntity.EMPTY,
                EmployerApplicationResponse[].class,
                "OF-1"
        );

        assertThat(appsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(appsResponse.getBody()).isNotEmpty();
        assertThat(appsResponse.getBody()[0].getCandidateName()).isEqualTo("Jane Doe");
    }

    @AfterAll
    static void tearDown() {
        wireMockServer.stop();
        postgres.stop();
    }
}
