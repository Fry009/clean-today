package com.cleany.infojobs.infrastructure.db.entity;

import com.cleany.infojobs.domain.model.Candidate;
import jakarta.persistence.*;

@Entity
@Table(name = "candidates")
public class CandidateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String phone;

    protected CandidateEntity() {
    }

    public CandidateEntity(Long id, String fullName, String email, String phone) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
    }

    public static CandidateEntity fromDomain(Candidate candidate) {
        return new CandidateEntity(candidate.getId(), candidate.getFullName(), candidate.getEmail(), candidate.getPhone());
    }

    public Candidate toDomain() {
        return new Candidate(id, fullName, email, phone);
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }
}
