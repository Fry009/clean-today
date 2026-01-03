package com.cleany.infojobs.infrastructure.infojobs;

import com.cleany.infojobs.config.InfoJobsProperties;
import com.cleany.infojobs.domain.model.CandidateProfile;
import com.cleany.infojobs.domain.model.CurriculumSummary;
import com.cleany.infojobs.domain.model.Skill;
import com.cleany.infojobs.domain.model.SkillCategory;
import com.cleany.infojobs.domain.port.CandidateGateway;
import com.cleany.infojobs.infrastructure.infojobs.dto.InfoJobsCandidateProfileResponse;
import com.cleany.infojobs.infrastructure.infojobs.dto.InfoJobsCurriculumResponse;
import com.cleany.infojobs.infrastructure.infojobs.dto.InfoJobsSkillCategoriesResponse;
import com.cleany.infojobs.infrastructure.infojobs.dto.InfoJobsSkillResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Objects;

@Component
public class CandidateGatewayAdapter implements CandidateGateway {

    private static final Logger log = LoggerFactory.getLogger(CandidateGatewayAdapter.class);

    private final WebClient webClient;

    public CandidateGatewayAdapter(@Qualifier("infoJobsWebClient") WebClient infoJobsWebClient, InfoJobsProperties properties) {
        this.webClient = infoJobsWebClient.mutate()
                .baseUrl(properties.getBaseUrl())
                .build();
    }

    @Override
    public CandidateProfile fetchProfile() {
        InfoJobsCandidateProfileResponse response = webClient.get()
                .uri("/candidate")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(InfoJobsCandidateProfileResponse.class)
                .onErrorResume(ex -> {
                    log.error("Failed to fetch candidate profile from InfoJobs", ex);
                    return Mono.empty();
                })
                .block();

        if (response == null) {
            return null;
        }

        return new CandidateProfile(
                response.getId(),
                response.getName(),
                response.getEmail(),
                response.getPhone(),
                response.getProvince()
        );
    }

    @Override
    public List<SkillCategory> fetchSkillCategories() {
        InfoJobsSkillCategoriesResponse response = webClient.get()
                .uri("/candidate/skillcategory")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(InfoJobsSkillCategoriesResponse.class)
                .onErrorResume(ex -> {
                    log.error("Failed to fetch skill categories from InfoJobs", ex);
                    return Mono.just(new InfoJobsSkillCategoriesResponse());
                })
                .block();

        if (response == null || response.getSkillCategories() == null) {
            return List.of();
        }

        return response.getSkillCategories().stream()
                .map(cat -> new SkillCategory(cat.getId(), cat.getName()))
                .toList();
    }

    @Override
    public List<Skill> fetchSkillsByCategory(String categoryId) {
        InfoJobsSkillResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/candidate/skill")
                        .queryParam("skillCategoryId", categoryId)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(InfoJobsSkillResponse.class)
                .onErrorResume(ex -> {
                    log.error("Failed to fetch skills from InfoJobs", ex);
                    return Mono.just(new InfoJobsSkillResponse());
                })
                .block();

        if (response == null || response.getSkills() == null) {
            return List.of();
        }

        return response.getSkills().stream()
                .filter(Objects::nonNull)
                .map(skill -> new Skill(skill.getId(), skill.getName(), categoryId))
                .toList();
    }

    @Override
    public List<CurriculumSummary> fetchCurriculums() {
        InfoJobsCurriculumResponse response = webClient.get()
                .uri("/curriculum")
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(InfoJobsCurriculumResponse.class)
                .onErrorResume(ex -> {
                    log.error("Failed to fetch curriculums from InfoJobs", ex);
                    return Mono.just(new InfoJobsCurriculumResponse());
                })
                .block();

        if (response == null || response.getCurriculums() == null) {
            return List.of();
        }

        return response.getCurriculums().stream()
                .map(curriculum -> new CurriculumSummary(
                        curriculum.getId(),
                        curriculum.getName(),
                        curriculum.isPrincipal()))
                .toList();
    }
}
