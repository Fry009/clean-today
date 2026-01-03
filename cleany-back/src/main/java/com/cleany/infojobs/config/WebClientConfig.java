package com.cleany.infojobs.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {
    @Bean
    public WebClient infoJobsWebClient(InfoJobsProperties properties) {
        return WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .build();
    }

    @Bean
    public WebClient employerWebClient(InfoJobsProperties properties) {
        return WebClient.builder()
                .baseUrl(properties.getEmployerBaseUrl())
                .build();
    }
}
