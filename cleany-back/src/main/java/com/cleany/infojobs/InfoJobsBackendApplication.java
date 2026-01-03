package com.cleany.infojobs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class InfoJobsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(InfoJobsBackendApplication.class, args);
    }
}
