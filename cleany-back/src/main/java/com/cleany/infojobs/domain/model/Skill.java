package com.cleany.infojobs.domain.model;

public class Skill {
    private final String id;
    private final String name;
    private final String categoryId;

    public Skill(String id, String name, String categoryId) {
        this.id = id;
        this.name = name;
        this.categoryId = categoryId;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategoryId() {
        return categoryId;
    }
}
