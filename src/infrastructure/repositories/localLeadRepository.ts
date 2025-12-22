import { Lead, LeadStatus, ServiceJob } from '@core/entities/types';
import { LeadRepository } from '@core/ports/repositories';

import { db } from '../storage/dexieClient';

export class LocalLeadRepository implements LeadRepository {
  async list(filters?: { status?: LeadStatus; source?: string; type?: string }): Promise<Lead[]> {
    const leads = await db.leads.toArray();
    return leads.filter((lead) => {
      if (filters?.status && lead.status !== filters.status) return false;
      if (filters?.source && lead.source !== filters.source) return false;
      if (filters?.type && lead.type !== filters.type) return false;
      return true;
    });
  }

  async save(lead: Lead): Promise<void> {
    await db.leads.put(lead);
  }

  async bulkSave(leads: Lead[]): Promise<void> {
    await db.leads.bulkPut(leads);
  }

  async markStatus(id: string, status: LeadStatus): Promise<Lead | undefined> {
    const current = await db.leads.get(id);
    if (!current) return undefined;
    const next = { ...current, status };
    await db.leads.put(next);
    return next;
  }

  async convertToJob(id: string, job: ServiceJob): Promise<void> {
    const current = await db.leads.get(id);
    if (current) {
      await db.leads.put({ ...current, status: 'saved', notes: 'Convertido a job' });
    }
    await db.jobs.put(job);
  }
}
