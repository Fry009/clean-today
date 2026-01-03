package com.cleany.infojobs.infrastructure.infojobs.dto;

import java.util.List;

public class InfoJobsSkillCategoriesResponse {
    private List<InfoJobsSkillCategoryDto> skillCategories;

    public List<InfoJobsSkillCategoryDto> getSkillCategories() {
        return skillCategories;
    }

    public void setSkillCategories(List<InfoJobsSkillCategoryDto> skillCategories) {
        this.skillCategories = skillCategories;
    }

    public static class InfoJobsSkillCategoryDto {
        private String id;
        private String name;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
