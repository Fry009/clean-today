import {
  CheckInSession,
  Client,
  Employee,
  Evidence,
  FeatureFlag,
  KPI,
  Lead,
  LeadStatus,
  MarketEvent,
  PremiumPlan,
  ServiceJob
} from '../entities/types';

export interface JobRepository {
  listJobsForEmployee(employeeId: string): Promise<ServiceJob[]>;
  getJob(id: string): Promise<ServiceJob | undefined>;
  saveJob(job: ServiceJob): Promise<void>;
}

export interface CheckSessionRepository {
  getSession(jobId: string): Promise<CheckInSession | undefined>;
  saveSession(session: CheckInSession): Promise<void>;
}

export interface EvidenceRepository {
  getByJob(jobId: string): Promise<Evidence | undefined>;
  save(evidence: Evidence): Promise<void>;
}

export interface EmployeeRepository {
  getEmployee(id: string): Promise<Employee | undefined>;
}

export interface ClientRepository {
  getClient(id: string): Promise<Client | undefined>;
  list(): Promise<Client[]>;
  addClient(client: Client): Promise<void>;
}

export interface KpiRepository {
  save(kpi: KPI): Promise<void>;
  listByEmployee(employeeId: string): Promise<KPI[]>;
}

export interface FeatureFlagRepository {
  getPlan(employeeId: string): Promise<FeatureFlag>;
  upgradePlan(employeeId: string, plan: FeatureFlag['plan']): Promise<FeatureFlag>;
}

export interface OutboxRepository {
  enqueue(operation: PendingOperation): Promise<void>;
  list(): Promise<PendingOperation[]>;
  remove(id: string): Promise<void>;
}

export interface LeadRepository {
  list(filters?: { status?: LeadStatus; source?: string; type?: string }): Promise<Lead[]>;
  save(lead: Lead): Promise<void>;
  bulkSave(leads: Lead[]): Promise<void>;
  markStatus(id: string, status: LeadStatus): Promise<Lead | undefined>;
  convertToJob(id: string, job: ServiceJob): Promise<void>;
}

export interface MarketEventRepository {
  add(event: MarketEvent): Promise<void>;
  list(): Promise<MarketEvent[]>;
  clear(): Promise<void>;
}

export interface SettingsRepository {
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
}

export type PendingOperationType =
  | 'UPLOAD_EVIDENCE'
  | 'SYNC_CHECKLIST'
  | 'SYNC_SESSION'
  | 'UPGRADE_PLAN';

export interface PendingOperation {
  id: string;
  type: PendingOperationType;
  payload: unknown;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  demoMode: boolean;
  accent: 'ocean' | 'forest' | 'sunset';
  plan: PremiumPlan;
  trialEndsAt?: string;
  referralCode?: string;
}

export interface PdfExporter {
  exportJob(job: ServiceJob, evidence: Evidence | undefined): Promise<Blob>;
}
