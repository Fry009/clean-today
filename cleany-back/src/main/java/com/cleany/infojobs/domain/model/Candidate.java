package com.cleany.infojobs.domain.model;

import java.util.Objects;

public class Candidate {
    private final Long id;
    private final String fullName;
    private final String email;
    private final String phone;

    public Candidate(Long id, String fullName, String email, String phone) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public Candidate withId(Long newId) {
        return new Candidate(newId, fullName, email, phone);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Candidate candidate)) return false;
        return Objects.equals(email, candidate.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(email);
    }
}
