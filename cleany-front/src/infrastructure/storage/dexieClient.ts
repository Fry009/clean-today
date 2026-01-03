import {
  CheckInSession,
  Client,
  Employee,
  Evidence,
  KPI,
  Lead,
  MarketEvent,
  TrackedOpportunity,
  ServiceJob
} from '@core/entities/types';
import { PendingOperation } from '@core/ports/repositories';
import Dexie, { Table } from 'dexie';

export class AppDatabase extends Dexie {
  jobs!: Table<ServiceJob, string>;
  employees!: Table<Employee, string>;
  clients!: Table<Client, string>;
  sessions!: Table<CheckInSession, string>;
  evidences!: Table<Evidence, string>;
  kpis!: Table<KPI, number>;
  outbox!: Table<PendingOperation, string>;
  leads!: Table<Lead, string>;
  settings!: Table<{ id: string; value: unknown }, string>;
  marketEvents!: Table<MarketEvent, string>;
  trackedOpportunities!: Table<TrackedOpportunity, string>;

  constructor() {
    super('clean-today-db');
    this.version(4)
      .stores({
        jobs: 'id, employeeId, status',
        employees: 'id',
        clients: 'id',
        sessions: 'jobId',
        evidences: 'jobId',
        kpis: '++id, employeeId',
        outbox: 'id, type',
        leads: 'id, status, source, type',
        settings: 'id',
        marketEvents: 'id, portal, createdAt',
        trackedOpportunities: 'id, portal, status, createdAt'
      })
      .upgrade(async (tx) => {
        await tx.table('jobs').clear();
        await tx.table('leads').clear();
        await tx.table('sessions').clear();
        await tx.table('evidences').clear();
        await tx.table('kpis').clear();
      });
  }
}

export const db = new AppDatabase();
