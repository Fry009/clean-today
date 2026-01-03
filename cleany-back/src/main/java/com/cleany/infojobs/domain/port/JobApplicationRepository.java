package com.cleany.infojobs.domain.port;

import com.cleany.infojobs.domain.model.JobApplication;

import java.util.List;

public interface JobApplicationRepository {
    JobApplication save(JobApplication application);

    List<JobApplication> findAll();
}
