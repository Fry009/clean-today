package com.cleany.infojobs.domain.model;

import java.util.Objects;

public class CandidateProfile {
    private final String id;
    private final String name;
    private final String email;
    private final String phone;
    private final String province;

    public CandidateProfile(String id, String name, String email, String phone, String province) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.province = province;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getProvince() {
        return province;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CandidateProfile that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
