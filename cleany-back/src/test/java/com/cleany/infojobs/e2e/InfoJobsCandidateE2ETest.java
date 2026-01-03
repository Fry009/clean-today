package com.cleany.infojobs.e2e;

import com.cleany.infojobs.infrastructure.http.dto.CandidateProfileResponse;
import com.cleany.infojobs.infrastructure.http.dto.CurriculumResponse;
import com.cleany.infojobs.infrastructure.http.dto.SkillCategoryResponse;
import com.cleany.infojobs.infrastructure.http.dto.SkillResponse;
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

import java.util.Arrays;
import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.resetAllRequests;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlMatching;
import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class InfoJobsCandidateE2ETest {

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
        stubCandidate();
        stubSkillCategories();
        stubSkills();
        stubCurriculums();
    }

    private void stubCandidate() {
        String payload = """
                {
                  "id": "cand-1",
                  "name": "Jane Doe",
                  "email": "jane@example.com",
                  "phone": "600000000",
                  "province": "Madrid"
                }
                """;
        stubFor(get(urlMatching("/candidate"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(payload)));
    }

    private void stubSkillCategories() {
        String payload = """
                {
                  "skillCategories": [
                    {"id": "1", "name": "Technology"},
                    {"id": "2", "name": "Marketing"}
                  ]
                }
                """;
        stubFor(get(urlMatching("/candidate/skillcategory"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(payload)));
    }

    private void stubSkills() {
        String payload = """
                {
                  "skills": [
                    {"id": "10", "name": "Java"},
                    {"id": "11", "name": "Spring"}
                  ]
                }
                """;
        stubFor(get(urlMatching("/candidate/skill.*"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(payload)));
    }

    private void stubCurriculums() {
        String payload = """
                {
                  "curriculums": [
                    {"id": "cv-1", "name": "Principal", "principal": true},
                    {"id": "cv-2", "name": "Ingles", "principal": false}
                  ]
                }
                """;
        stubFor(get(urlMatching("/curriculum"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(payload)));
    }

    @Test
    void shouldFetchCandidateDataFromInfoJobs() {
        ResponseEntity<CandidateProfileResponse> profileResponse = restTemplate.getForEntity(
                "/api/candidates/profile",
                CandidateProfileResponse.class
        );

        assertThat(profileResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(profileResponse.getBody()).isNotNull();
        assertThat(profileResponse.getBody().getEmail()).isEqualTo("jane@example.com");

        ResponseEntity<SkillCategoryResponse[]> categoriesResponse = restTemplate.getForEntity(
                "/api/candidates/skill-categories",
                SkillCategoryResponse[].class
        );

        List<SkillCategoryResponse> categories = Arrays.asList(categoriesResponse.getBody());
        assertThat(categoriesResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(categories).extracting(SkillCategoryResponse::getName).contains("Technology");

        ResponseEntity<SkillResponse[]> skillsResponse = restTemplate.getForEntity(
                "/api/candidates/skills?categoryId=1",
                SkillResponse[].class
        );
        assertThat(skillsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(skillsResponse.getBody()).isNotEmpty();
        assertThat(skillsResponse.getBody()[0].getCategoryId()).isEqualTo("1");

        ResponseEntity<CurriculumResponse[]> curriculumsResponse = restTemplate.getForEntity(
                "/api/candidates/curriculums",
                CurriculumResponse[].class
        );
        assertThat(curriculumsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(curriculumsResponse.getBody()).hasSize(2);
        assertThat(curriculumsResponse.getBody()[0].isPrincipal()).isTrue();
    }

    @AfterAll
    static void tearDown() {
        wireMockServer.stop();
        postgres.stop();
    }
}
