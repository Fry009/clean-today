package com.cleany.infojobs.domain.model;

public class CurriculumSummary {
    private final String id;
    private final String name;
    private final boolean principal;

    public CurriculumSummary(String id, String name, boolean principal) {
        this.id = id;
        this.name = name;
        this.principal = principal;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isPrincipal() {
        return principal;
    }
}
