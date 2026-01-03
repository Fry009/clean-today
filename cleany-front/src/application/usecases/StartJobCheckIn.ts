import { CheckInSession } from '@core/entities/types';
import { CheckSessionRepository, OutboxRepository } from '@core/ports/repositories';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

export class StartJobCheckIn {
  constructor(
    private readonly sessions: CheckSessionRepository,
    private readonly outbox: OutboxRepository
  ) {}

  async execute(jobId: string, geoStart?: string): Promise<CheckInSession> {
    const session: CheckInSession = {
      jobId,
      startedAt: dayjs().toISOString(),
      geoStart,
      timerEvents: [{ label: 'start', startedAt: dayjs().toISOString() }]
    };
    await this.sessions.saveSession(session);
    await this.outbox.enqueue({
      id: uuid(),
      type: 'SYNC_SESSION',
      payload: session,
      createdAt: dayjs().toISOString()
    });
    return session;
  }
}
