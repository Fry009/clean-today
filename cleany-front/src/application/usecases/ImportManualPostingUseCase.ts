import { JobPosting } from '@core/entities/types';
import { JobPostingRepository } from '@core/ports/repositories';
import { hashKey } from '@core/domain/jobOffers';

export class ImportManualPostingUseCase {
  constructor(private readonly repo: JobPostingRepository) {}

  async execute(input: Omit<JobPosting, 'id' | 'createdAt' | 'sourceName' | 'sourceUrl'>): Promise<JobPosting> {
    const now = new Date().toISOString();
    const id = hashKey([input.title, input.company, input.applyUrl, now]);
    const posting: JobPosting = {
      ...input,
      id,
      createdAt: now,
      sourceName: 'manual',
      sourceUrl: input.applyUrl,
      province: input.location
    };
    await this.repo.upsertMany([posting]);
    return posting;
  }
}
