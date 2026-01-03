import { Evidence } from '@core/entities/types';
import { EvidenceRepository } from '@core/ports/repositories';

import { db } from '../storage/dexieClient';

export class LocalEvidenceRepository implements EvidenceRepository {
  async getByJob(jobId: string): Promise<Evidence | undefined> {
    return db.evidences.get(jobId);
  }

  async save(evidence: Evidence): Promise<void> {
    await db.evidences.put(evidence);
  }
}
