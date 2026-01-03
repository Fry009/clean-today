import { Lead } from '@core/entities/types';
import { LeadRepository } from '@core/ports/repositories';

export class SaveLead {
  constructor(private readonly repo: LeadRepository) {}

  async execute(id: string): Promise<Lead | undefined> {
    return this.repo.markStatus(id, 'saved');
  }
}
