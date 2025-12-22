import { KPI } from '@core/entities/types';
import { KpiRepository } from '@core/ports/repositories';

import { db } from '../storage/dexieClient';

export class LocalKpiRepository implements KpiRepository {
  async save(kpi: KPI): Promise<void> {
    await db.kpis.add(kpi);
  }

  async listByEmployee(employeeId: string): Promise<KPI[]> {
    return db.kpis.where('employeeId').equals(employeeId).toArray();
  }
}
