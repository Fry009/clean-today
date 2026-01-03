package com.cleany.infojobs.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "infojobs")
public class InfoJobsProperties {
    private String baseUrl;
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String scope;
    private String employerBaseUrl;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public void setRedirectUri(String redirectUri) {
        this.redirectUri = redirectUri;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public String getEmployerBaseUrl() {
        return employerBaseUrl != null ? employerBaseUrl : baseUrl;
    }

    public void setEmployerBaseUrl(String employerBaseUrl) {
        this.employerBaseUrl = employerBaseUrl;
    }
}
