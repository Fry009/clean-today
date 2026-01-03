import { KPI } from '@core/entities/types';
import { CheckSessionRepository, JobRepository, KpiRepository } from '@core/ports/repositories';
import dayjs from 'dayjs';

export class ComputeKPIsForEmployee {
  constructor(
    private readonly jobs: JobRepository,
    private readonly sessions: CheckSessionRepository,
    private readonly kpis: KpiRepository
  ) {}

  async execute(employeeId: string, period: 'week' | 'month' = 'week'): Promise<KPI> {
    const jobs = await this.jobs.listJobsForEmployee(employeeId);
    const now = dayjs();
    const filtered = jobs.filter((job) => {
      const diff = now.diff(dayjs(job.scheduledAt), period === 'week' ? 'day' : 'month');
      return period === 'week' ? diff <= 7 : diff <= 1;
    });
    const doneJobs = filtered.filter((job) => job.status === 'done');
    const sessions = await Promise.all(doneJobs.map((job) => this.sessions.getSession(job.id)));
    const totalMinutes = sessions.reduce((acc, session) => {
      if (!session?.endedAt) return acc;
      const mins = dayjs(session.endedAt).diff(dayjs(session.startedAt), 'minute');
      return acc + mins;
    }, 0);
    const kpi: KPI = {
      employeeId,
      period,
      jobsDone: doneJobs.length,
      avgTime: doneJobs.length ? totalMinutes / doneJobs.length : 0,
      avgRating: 4.6,
      recurringRate: 0.35,
      cancellations: filtered.filter((job) => job.status === 'canceled').length,
      revenue: doneJobs.reduce((acc, job) => acc + job.price.amount, 0),
      distanceKm: filtered.length * 2.1
    };
    await this.kpis.save(kpi);
    return kpi;
  }
}
