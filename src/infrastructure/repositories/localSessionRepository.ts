import { CheckInSession } from '@core/entities/types';
import { CheckSessionRepository } from '@core/ports/repositories';

import { db } from '../storage/dexieClient';

export class LocalSessionRepository implements CheckSessionRepository {
  async getSession(jobId: string): Promise<CheckInSession | undefined> {
    return db.sessions.get(jobId);
  }

  async saveSession(session: CheckInSession): Promise<void> {
    await db.sessions.put(session);
  }
}
