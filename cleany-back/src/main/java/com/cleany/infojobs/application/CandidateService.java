package com.cleany.infojobs.application;

import com.cleany.infojobs.domain.model.CandidateProfile;
import com.cleany.infojobs.domain.model.CurriculumSummary;
import com.cleany.infojobs.domain.model.Skill;
import com.cleany.infojobs.domain.model.SkillCategory;
import com.cleany.infojobs.domain.port.CandidateGateway;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CandidateService {

    private final CandidateGateway candidateGateway;

    public CandidateService(CandidateGateway candidateGateway) {
        this.candidateGateway = candidateGateway;
    }

    public CandidateProfile profile() {
        return candidateGateway.fetchProfile();
    }

    public List<SkillCategory> skillCategories() {
        return candidateGateway.fetchSkillCategories();
    }

    public List<Skill> skillsByCategory(String categoryId) {
        return candidateGateway.fetchSkillsByCategory(categoryId);
    }

    public List<CurriculumSummary> curriculums() {
        return candidateGateway.fetchCurriculums();
    }
}
