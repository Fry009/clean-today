import { MarketOfferResult, TrackedOpportunity } from '@core/entities/types';
import { TrackedOpportunityRepository } from '@core/ports/repositories';
import { v4 as uuid } from 'uuid';

export class AddTrackedOpportunity {
  constructor(private readonly repo: TrackedOpportunityRepository) {}

  async execute(input: { result: MarketOfferResult }): Promise<{ opportunity: TrackedOpportunity; duplicated: boolean }> {
    const existing = await this.repo.findByOutboundUrl(input.result.outboundUrl);
    if (existing) {
      return { opportunity: existing, duplicated: true };
    }
    const now = new Date().toISOString();
    const opportunity: TrackedOpportunity = {
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      source: 'market',
      portal: input.result.portal,
      title: input.result.title,
      location: input.result.location,
      category: input.result.category,
      priceOrSalary: input.result.priceOrSalary,
      outboundUrl: input.result.outboundUrl,
      status: 'saved',
      notes: '',
      tags: [],
      lastOpenedAt: null,
      openCount: 0
    };
    await this.repo.add(opportunity);
    return { opportunity, duplicated: false };
  }
}
