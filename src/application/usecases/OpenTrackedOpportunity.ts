import { TrackedOpportunity } from '@core/entities/types';
import { TrackedOpportunityRepository } from '@core/ports/repositories';

export class OpenTrackedOpportunity {
  constructor(private readonly repo: TrackedOpportunityRepository) {}

  async execute(id: string): Promise<TrackedOpportunity | undefined> {
    return this.repo.incrementOpenCount(id);
  }
}
