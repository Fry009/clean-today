package com.cleany.infojobs.infrastructure.infojobs.dto;

import java.util.List;

public class InfoJobsCurriculumResponse {
    private List<InfoJobsCurriculumDto> curriculums;

    public List<InfoJobsCurriculumDto> getCurriculums() {
        return curriculums;
    }

    public void setCurriculums(List<InfoJobsCurriculumDto> curriculums) {
        this.curriculums = curriculums;
    }

    public static class InfoJobsCurriculumDto {
        private String id;
        private String name;
        private boolean principal;

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

        public boolean isPrincipal() {
            return principal;
        }

        public void setPrincipal(boolean principal) {
            this.principal = principal;
        }
    }
}
