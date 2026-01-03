package com.cleany.infojobs.infrastructure.infojobs.dto;

import java.util.List;

public class InfoJobsSkillResponse {
    private List<InfoJobsSkillDto> skills;

    public List<InfoJobsSkillDto> getSkills() {
        return skills;
    }

    public void setSkills(List<InfoJobsSkillDto> skills) {
        this.skills = skills;
    }

    public static class InfoJobsSkillDto {
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
