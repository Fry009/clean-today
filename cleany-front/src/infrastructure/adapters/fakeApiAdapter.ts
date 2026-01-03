import { Client, Employee, Evidence, Lead, ServiceJob } from '@core/entities/types';
import { PendingOperation } from '@core/ports/repositories';
import { RemoteSyncPort } from '@core/ports/sync';
import demoData from '@shared/demoData';

export class FakeApiAdapter implements RemoteSyncPort {
  private jobs: ServiceJob[];
  private evidences: Record<string, Evidence>;
  private leads: Lead[];
  private clients: Client[];
  private employees: Employee[];

  constructor() {
    this.jobs = [...demoData.jobs];
    this.evidences = Object.fromEntries(
      demoData.evidences.map((ev) => [ev.jobId, ev])
    );
    this.leads = [...demoData.leads];
    this.clients = [...demoData.clients];
    this.employees = [...demoData.employees];
  }

  async fetchSeed() {
    return {
      jobs: this.jobs,
      evidences: Object.values(this.evidences),
      leads: this.leads,
      clients: this.clients,
      employees: this.employees
    };
  }

  async push(operation: PendingOperation): Promise<void> {
    // simulate latency
    await new Promise((res) => setTimeout(res, 100));
    if (operation.type === 'UPLOAD_EVIDENCE') {
      const { jobId } = operation.payload as { jobId: string };
      const existing = this.evidences[jobId] || {
        jobId,
        beforePhotos: [],
        afterPhotos: [],
        checklist: []
      };
      this.evidences[jobId] = existing;
    }
    if (operation.type === 'UPGRADE_PLAN') {
      // stub
    }
  }
}
