import { ServiceJob } from '@core/entities/types';
import { JobRepository,LeadRepository } from '@core/ports/repositories';
import { v4 as uuid } from 'uuid';

export class ConvertLeadToJob {
  constructor(private readonly leadRepo: LeadRepository, private readonly jobRepo: JobRepository) {}

  async execute(leadId: string, employeeId: string): Promise<ServiceJob | undefined> {
    const lead = (await this.leadRepo.list()).find((l) => l.id === leadId);
    if (!lead) return undefined;
    const job: ServiceJob = {
      id: `job-${uuid()}`,
      clientId: 'cli-1',
      employeeId,
      type: lead.type,
      scheduledAt: new Date().toISOString(),
      status: 'pending',
      price: lead.price,
      durationEstimate: 90,
      notes: lead.title
    };
    await this.jobRepo.saveJob(job);
    await this.leadRepo.convertToJob(leadId, job);
    return job;
  }
}
