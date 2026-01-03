import { ServiceJob } from '@core/entities/types';
import { JobRepository } from '@core/ports/repositories';

import { db } from '../storage/dexieClient';

export class LocalJobRepository implements JobRepository {
  async listJobsForEmployee(employeeId: string): Promise<ServiceJob[]> {
    return db.jobs.where('employeeId').equals(employeeId).sortBy('scheduledAt');
  }

  async getJob(id: string): Promise<ServiceJob | undefined> {
    return db.jobs.get(id);
  }

  async saveJob(job: ServiceJob): Promise<void> {
    await db.jobs.put(job);
  }
}
