import { JobPostingRepository } from '@core/ports/repositories';
import { JobPosting, RemoteType } from '@core/entities/types';

export type JobPostFilters = {
  text?: string;
  location?: string;
  province?: string;
  country?: string;
  remoteType?: RemoteType;
  tags?: string[];
  sourceName?: string;
  favorites?: boolean;
};

export class ListJobPostingsUseCase {
  constructor(private readonly repo: JobPostingRepository) {}

  execute(filters?: JobPostFilters): Promise<JobPosting[]> {
    return this.repo.list(filters);
  }
}
