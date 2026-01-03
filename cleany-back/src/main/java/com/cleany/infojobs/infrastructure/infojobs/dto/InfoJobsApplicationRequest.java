package com.cleany.infojobs.infrastructure.infojobs.dto;

public class InfoJobsApplicationRequest {
    private String offerId;
    private String fullName;
    private String email;
    private String phone;

    public InfoJobsApplicationRequest(String offerId, String fullName, String email, String phone) {
        this.offerId = offerId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
    }

    public String getOfferId() {
        return offerId;
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
}
