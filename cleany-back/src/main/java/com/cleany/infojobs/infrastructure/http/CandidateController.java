package com.cleany.infojobs.infrastructure.http;

import com.cleany.infojobs.application.CandidateService;
import com.cleany.infojobs.infrastructure.http.dto.CandidateProfileResponse;
import com.cleany.infojobs.infrastructure.http.dto.CurriculumResponse;
import com.cleany.infojobs.infrastructure.http.dto.SkillCategoryResponse;
import com.cleany.infojobs.infrastructure.http.dto.SkillResponse;
import com.cleany.infojobs.infrastructure.http.mapper.HttpMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;
    private final HttpMapper mapper;

    public CandidateController(CandidateService candidateService, HttpMapper mapper) {
        this.candidateService = candidateService;
        this.mapper = mapper;
    }

    @GetMapping("/profile")
    public ResponseEntity<CandidateProfileResponse> profile() {
        var profile = candidateService.profile();
        return ResponseEntity.ok(mapper.toCandidateProfileResponse(profile));
    }

    @GetMapping("/skill-categories")
    public ResponseEntity<List<SkillCategoryResponse>> skillCategories() {
        var categories = candidateService.skillCategories();
        return ResponseEntity.ok(mapper.toSkillCategoryResponse(categories));
    }

    @GetMapping("/skills")
    public ResponseEntity<List<SkillResponse>> skills(@RequestParam String categoryId) {
        var skills = candidateService.skillsByCategory(categoryId);
        return ResponseEntity.ok(mapper.toSkillResponse(skills));
    }

    @GetMapping("/curriculums")
    public ResponseEntity<List<CurriculumResponse>> curriculums() {
        var curriculums = candidateService.curriculums();
        return ResponseEntity.ok(mapper.toCurriculumResponse(curriculums));
    }
}
