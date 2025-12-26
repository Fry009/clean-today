import { TrackedOpportunity } from '@core/entities/types';
import { TrackedOpportunityRepository } from '@core/ports/repositories';

export class UpdateTrackedOpportunity {
  constructor(private readonly repo: TrackedOpportunityRepository) {}

  async execute(id: string, patch: Partial<TrackedOpportunity>): Promise<TrackedOpportunity | undefined> {
    return this.repo.update(id, patch);
  }
}
