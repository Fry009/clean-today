import { CheckInSession, KPI, ServiceJob } from '@core/entities/types';
import { CheckSessionRepository, JobRepository, KpiRepository } from '@core/ports/repositories';

import { ComputeKPIsForEmployee } from '../ComputeKPIsForEmployee';

class InMemoryJobs implements JobRepository {
  constructor(private jobs: ServiceJob[]) {}
  listJobsForEmployee(_employeeId: string): Promise<ServiceJob[]> {
    return Promise.resolve(this.jobs);
  }
  getJob(): Promise<ServiceJob | undefined> {
    return Promise.resolve(undefined);
  }
  saveJob(): Promise<void> {
    return Promise.resolve();
  }
}

class InMemorySessions implements CheckSessionRepository {
  constructor(private sessions: Record<string, CheckInSession>) {}
  getSession(jobId: string): Promise<CheckInSession | undefined> {
    return Promise.resolve(this.sessions[jobId]);
  }
  saveSession(): Promise<void> {
    return Promise.resolve();
  }
}

class InMemoryKpiRepo implements KpiRepository {
  items: KPI[] = [];
  save(kpi: KPI): Promise<void> {
    this.items.push(kpi);
    return Promise.resolve();
  }
  listByEmployee(_employeeId: string): Promise<KPI[]> {
    return Promise.resolve(this.items);
  }
}

describe('ComputeKPIsForEmployee', () => {
  it('calculates average time and revenue', async () => {
    const jobs: ServiceJob[] = [
      {
        id: '1',
        clientId: 'c1',
        employeeId: 'e1',
        type: 'hogar',
        scheduledAt: new Date().toISOString(),
        status: 'done',
        price: { amount: 50, currency: 'EUR' },
        durationEstimate: 60
      }
    ];
    const sessions: Record<string, CheckInSession> = {
      '1': {
        jobId: '1',
        startedAt: new Date().toISOString(),
        endedAt: new Date(Date.now() + 60 * 60000).toISOString(),
        timerEvents: []
      }
    };
    const usecase = new ComputeKPIsForEmployee(
      new InMemoryJobs(jobs),
      new InMemorySessions(sessions),
      new InMemoryKpiRepo()
    );
    const result = await usecase.execute('e1', 'week');
    expect(result.avgTime).toBeGreaterThan(0);
    expect(result.revenue).toBe(50);
  });
});
