package com.cleany.infojobs.domain.port;

import com.cleany.infojobs.domain.model.CandidateProfile;
import com.cleany.infojobs.domain.model.CurriculumSummary;
import com.cleany.infojobs.domain.model.Skill;
import com.cleany.infojobs.domain.model.SkillCategory;

import java.util.List;

public interface CandidateGateway {

    CandidateProfile fetchProfile();

    List<SkillCategory> fetchSkillCategories();

    List<Skill> fetchSkillsByCategory(String categoryId);

    List<CurriculumSummary> fetchCurriculums();
}
