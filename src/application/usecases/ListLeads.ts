import { Lead, LeadStatus } from '@core/entities/types';
import { LeadRepository } from '@core/ports/repositories';

export class ListLeads {
  constructor(private readonly repo: LeadRepository) {}

  async execute(filters?: { status?: LeadStatus; source?: string; type?: string }): Promise<Lead[]> {
    return this.repo.list(filters);
  }
}
