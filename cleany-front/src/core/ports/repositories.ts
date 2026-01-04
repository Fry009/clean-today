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
  OpportunityStatus,
  PremiumPlan,
  TrackedOpportunity,
  ServiceJob,
  JobPosting,
  RemoteType,
  Source
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

export interface TrackedOpportunityRepository {
  add(opportunity: TrackedOpportunity): Promise<TrackedOpportunity>;
  update(id: string, patch: Partial<TrackedOpportunity>): Promise<TrackedOpportunity | undefined>;
  list(filters?: { status?: OpportunityStatus; portal?: string }): Promise<TrackedOpportunity[]>;
  getById(id: string): Promise<TrackedOpportunity | undefined>;
  delete(id: string): Promise<void>;
  incrementOpenCount(id: string): Promise<TrackedOpportunity | undefined>;
  findByOutboundUrl(outboundUrl: string): Promise<TrackedOpportunity | undefined>;
}

export interface SettingsRepository {
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
}

export interface JobPostingRepository {
  upsertMany(postings: JobPosting[]): Promise<void>;
  list(filters?: {
    text?: string;
    location?: string;
    remoteType?: RemoteType;
    tags?: string[];
    sourceName?: string;
    favorites?: boolean;
  }): Promise<JobPosting[]>;
  getById(id: string): Promise<JobPosting | undefined>;
  markFavorite(id: string, favorite: boolean): Promise<void>;
}

export interface SourceRepository {
  listEnabled(): Promise<Source[]>;
  upsert(source: Source): Promise<void>;
  disable(sourceId: string): Promise<void>;
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
