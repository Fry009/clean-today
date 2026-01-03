import { Lead, LeadStatus, ServiceJob } from '@core/entities/types';
import { JobRepository,LeadRepository } from '@core/ports/repositories';
import { beforeEach,describe, expect, it } from 'vitest';

import { ConvertLeadToJob } from '../ConvertLeadToJob';
import { DiscardLead } from '../DiscardLead';
import { ListLeads } from '../ListLeads';
import { RefreshLeads } from '../RefreshLeads';
import { SaveLead } from '../SaveLead';

const euro = (amount: number) => ({ amount, currency: 'EUR' as const });

class InMemoryLeadRepo implements LeadRepository {
  leads: Lead[] = [];
  async list(filters?: { status?: LeadStatus; source?: string; type?: string }): Promise<Lead[]> {
    return this.leads.filter((l) => {
      if (filters?.status && l.status !== filters.status) return false;
      if (filters?.source && l.source !== filters.source) return false;
      if (filters?.type && l.type !== filters.type) return false;
      return true;
    });
  }
  async save(lead: Lead): Promise<void> {
    const idx = this.leads.findIndex((l) => l.id === lead.id);
    if (idx >= 0) this.leads[idx] = lead;
    else this.leads.push(lead);
  }
  async bulkSave(leads: Lead[]): Promise<void> {
    this.leads = [...this.leads, ...leads];
  }
  async markStatus(id: string, status: LeadStatus): Promise<Lead | undefined> {
    const lead = this.leads.find((l) => l.id === id);
    if (!lead) return undefined;
    lead.status = status;
    return lead;
  }
  async convertToJob(id: string, _job: ServiceJob): Promise<void> {
    const lead = this.leads.find((l) => l.id === id);
    if (lead) lead.status = 'saved';
    // job persistence handled by job repo in tests
  }
}

class InMemoryJobRepo implements JobRepository {
  jobs: ServiceJob[] = [];
  async listJobsForEmployee(_employeeId: string): Promise<ServiceJob[]> {
    return this.jobs;
  }
  async getJob(id: string): Promise<ServiceJob | undefined> {
    return this.jobs.find((j) => j.id === id);
  }
  async saveJob(job: ServiceJob): Promise<void> {
    this.jobs.push(job);
  }
}

const baseLead = (id: string): Lead => ({
  id,
  source: 'milanuncios',
  title: 'Lead',
  url: 'http://example.com',
  location: 'Madrid',
  price: euro(50),
  distanceKm: 2,
  postedHoursAgo: 1,
  type: 'hogar',
  status: 'unhandled',
  createdAt: new Date().toISOString()
});

describe('Lead use cases', () => {
  let leadRepo: InMemoryLeadRepo;
  let jobRepo: InMemoryJobRepo;

  beforeEach(() => {
    leadRepo = new InMemoryLeadRepo();
    jobRepo = new InMemoryJobRepo();
    leadRepo.leads = [baseLead('1'), { ...baseLead('2'), status: 'saved', source: 'indeed' }];
  });

  it('lists leads with filters', async () => {
    const uc = new ListLeads(leadRepo);
    const saved = await uc.execute({ status: 'saved' });
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('2');
  });

  it('refresh adds new leads', async () => {
    const uc = new RefreshLeads(leadRepo);
    const all = await uc.execute();
    expect(all.length).toBeGreaterThan(2);
  });

  it('saves a lead as bookmarked', async () => {
    const uc = new SaveLead(leadRepo);
    const updated = await uc.execute('1');
    expect(updated?.status).toBe('saved');
  });

  it('discards a lead', async () => {
    const uc = new DiscardLead(leadRepo);
    const updated = await uc.execute('1');
    expect(updated?.status).toBe('discarded');
  });

  it('converts a lead into job', async () => {
    const uc = new ConvertLeadToJob(leadRepo, jobRepo);
    const job = await uc.execute('1', 'emp-1');
    expect(job?.employeeId).toBe('emp-1');
    expect(jobRepo.jobs).toHaveLength(1);
  });
});
