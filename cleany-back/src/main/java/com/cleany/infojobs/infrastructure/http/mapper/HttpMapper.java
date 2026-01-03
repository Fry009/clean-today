package com.cleany.infojobs.infrastructure.http.mapper;

import com.cleany.infojobs.domain.model.Candidate;
import com.cleany.infojobs.domain.model.CandidateProfile;
import com.cleany.infojobs.domain.model.CurriculumSummary;
import com.cleany.infojobs.domain.model.JobApplication;
import com.cleany.infojobs.domain.model.Offer;
import com.cleany.infojobs.domain.model.Skill;
import com.cleany.infojobs.domain.model.SkillCategory;
import com.cleany.infojobs.infrastructure.http.dto.CandidateRequest;
import com.cleany.infojobs.infrastructure.http.dto.CandidateProfileResponse;
import com.cleany.infojobs.infrastructure.http.dto.CurriculumResponse;
import com.cleany.infojobs.infrastructure.http.dto.JobApplicationResponse;
import com.cleany.infojobs.infrastructure.http.dto.OfferResponse;
import com.cleany.infojobs.infrastructure.http.dto.SkillCategoryResponse;
import com.cleany.infojobs.infrastructure.http.dto.SkillResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface HttpMapper {

    OfferResponse toOfferResponse(Offer offer);

    @Mapping(target = "status", expression = "java(application.getStatus().name())")
    JobApplicationResponse toJobApplicationResponse(JobApplication application);

    Candidate toCandidate(CandidateRequest request);

    CandidateProfileResponse toCandidateProfileResponse(CandidateProfile profile);

    CurriculumResponse toCurriculumResponse(CurriculumSummary summary);

    SkillCategoryResponse toSkillCategoryResponse(SkillCategory category);

    SkillResponse toSkillResponse(Skill skill);

    default List<SkillCategoryResponse> toSkillCategoryResponse(List<SkillCategory> categories) {
        if (categories == null) {
            return List.of();
        }
        return categories.stream().map(this::toSkillCategoryResponse).toList();
    }

    default List<SkillResponse> toSkillResponse(List<Skill> skills) {
        if (skills == null) {
            return List.of();
        }
        return skills.stream().map(this::toSkillResponse).toList();
    }

    default List<CurriculumResponse> toCurriculumResponse(List<CurriculumSummary> summaries) {
        if (summaries == null) {
            return List.of();
        }
        return summaries.stream().map(this::toCurriculumResponse).toList();
    }
}
