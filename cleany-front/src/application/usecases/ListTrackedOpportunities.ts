import { OpportunityStatus, TrackedOpportunity } from '@core/entities/types';
import { TrackedOpportunityRepository } from '@core/ports/repositories';

export class ListTrackedOpportunities {
  constructor(private readonly repo: TrackedOpportunityRepository) {}

  async execute(filters?: { status?: OpportunityStatus; portal?: string }): Promise<TrackedOpportunity[]> {
    return this.repo.list(filters);
  }
}
