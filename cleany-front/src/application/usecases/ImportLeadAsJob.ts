import { ServiceJob } from '@core/entities/types';
import { JobRepository,LeadRepository } from '@core/ports/repositories';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

export class ImportLeadAsJob {
  constructor(
    private readonly leads: LeadRepository,
    private readonly jobs: JobRepository
  ) {}

  async execute(leadId: string, employeeId: string, clientId: string): Promise<ServiceJob> {
    const lead = (await this.leads.list()).find((l) => l.id === leadId);
    if (!lead) throw new Error('Lead no encontrado');
    const job: ServiceJob = {
      id: uuid(),
      clientId,
      employeeId,
      type: 'hogar',
      scheduledAt: dayjs().add(1, 'day').toISOString(),
      status: 'pending',
      price: lead.price,
      durationEstimate: 90,
      notes: `Convertido desde lead ${lead.source}`
    };
    await this.jobs.saveJob(job);
    return job;
  }
}
