import { AddEvidencePhoto } from '@application/usecases/AddEvidencePhoto';
import { CaptureClientSignature } from '@application/usecases/CaptureClientSignature';
import { CompleteChecklist } from '@application/usecases/CompleteChecklist';
import { ComputeKPIsForEmployee } from '@application/usecases/ComputeKPIsForEmployee';
import { ConvertLeadToJob } from '@application/usecases/ConvertLeadToJob';
import { DiscardLead } from '@application/usecases/DiscardLead';
import { ExportJobReportPDF } from '@application/usecases/ExportJobReportPDF';
import { ImportLeadAsJob } from '@application/usecases/ImportLeadAsJob';
import { ListJobsForEmployee } from '@application/usecases/ListJobsForEmployee';
import { ListLeads } from '@application/usecases/ListLeads';
import { RefreshLeads } from '@application/usecases/RefreshLeads';
import { SaveLead } from '@application/usecases/SaveLead';
import { StartJobCheckIn } from '@application/usecases/StartJobCheckIn';
import { StopJobCheckOut } from '@application/usecases/StopJobCheckOut';
import { SyncPendingOperations } from '@application/usecases/SyncPendingOperations';
import { UpgradeToPremium } from '@application/usecases/UpgradeToPremium';

import { FakeApiAdapter } from './adapters/fakeApiAdapter';
import { JsPdfExporter } from './adapters/pdfExporter';
import { LocalClientRepository } from './repositories/localClientRepository';
import { LocalEmployeeRepository } from './repositories/localEmployeeRepository';
import { LocalEvidenceRepository } from './repositories/localEvidenceRepository';
import { LocalFeatureFlagRepository } from './repositories/localFeatureFlagRepository';
import { LocalJobRepository } from './repositories/localJobRepository';
import { LocalKpiRepository } from './repositories/localKpiRepository';
import { LocalLeadRepository } from './repositories/localLeadRepository';
import { LocalSessionRepository } from './repositories/localSessionRepository';
import { LocalSettingsRepository } from './repositories/localSettingsRepository';
import { OutboxDexieRepository } from './repositories/outboxRepository';
import { seedDatabase } from './storage/seedData';

export async function buildContainer() {
  await seedDatabase();

  const jobRepo = new LocalJobRepository();
  const evidenceRepo = new LocalEvidenceRepository();
  const sessionRepo = new LocalSessionRepository();
  const kpiRepo = new LocalKpiRepository();
  const flagRepo = new LocalFeatureFlagRepository();
  const outboxRepo = new OutboxDexieRepository();
  const pdfExporter = new JsPdfExporter();
  const fakeApi = new FakeApiAdapter();
  const employeeRepo = new LocalEmployeeRepository();
  const clientRepo = new LocalClientRepository();
  const settingsRepo = new LocalSettingsRepository();
  const leadRepo = new LocalLeadRepository();

  return {
    repos: {
      jobRepo,
      evidenceRepo,
      sessionRepo,
      kpiRepo,
      flagRepo,
      outboxRepo,
      employeeRepo,
      clientRepo,
      settingsRepo,
      leadRepo
    },
    usecases: {
      listJobs: new ListJobsForEmployee(jobRepo),
      startCheck: new StartJobCheckIn(sessionRepo, outboxRepo),
      stopCheck: new StopJobCheckOut(jobRepo, evidenceRepo, sessionRepo, outboxRepo),
      addPhoto: new AddEvidencePhoto(evidenceRepo, outboxRepo),
      completeChecklist: new CompleteChecklist(evidenceRepo, outboxRepo),
      captureSignature: new CaptureClientSignature(evidenceRepo, outboxRepo),
      computeKpis: new ComputeKPIsForEmployee(jobRepo, sessionRepo, kpiRepo),
      syncOps: new SyncPendingOperations(outboxRepo, fakeApi),
      upgrade: new UpgradeToPremium(flagRepo),
      exportPdf: new ExportJobReportPDF(pdfExporter, jobRepo, evidenceRepo),
      importLead: new ImportLeadAsJob(leadRepo, jobRepo),
      listLeads: new ListLeads(leadRepo),
      refreshLeads: new RefreshLeads(leadRepo),
      saveLead: new SaveLead(leadRepo),
      discardLead: new DiscardLead(leadRepo),
      convertLead: new ConvertLeadToJob(leadRepo, jobRepo)
    },
    adapters: {
      fakeApi
    }
  };
}
