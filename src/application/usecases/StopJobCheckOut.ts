import { canCheckout } from '@core/domain/rules';
import { CheckSessionRepository, EvidenceRepository, JobRepository, OutboxRepository } from '@core/ports/repositories';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

export class StopJobCheckOut {
  constructor(
    private readonly jobs: JobRepository,
    private readonly evidenceRepo: EvidenceRepository,
    private readonly sessions: CheckSessionRepository,
    private readonly outbox: OutboxRepository
  ) {}

  async execute(jobId: string): Promise<void> {
    const evidence = await this.evidenceRepo.getByJob(jobId);
    if (!canCheckout(evidence)) {
      throw new Error('No se puede cerrar: falta al menos una foto después o checklist completo');
    }
    const job = await this.jobs.getJob(jobId);
    if (!job) throw new Error('Job no encontrado');
    const session = await this.sessions.getSession(jobId);
    if (session && !session.endedAt) {
      session.endedAt = dayjs().toISOString();
      session.timerEvents.push({ label: 'stop', startedAt: session.startedAt, endedAt: session.endedAt });
      await this.sessions.saveSession(session);
    }
    await this.jobs.saveJob({ ...job, status: 'done' });
    await this.outbox.enqueue({
      id: uuid(),
      type: 'SYNC_SESSION',
      payload: session ?? { jobId, endedAt: dayjs().toISOString() },
      createdAt: dayjs().toISOString()
    });
  }
}
