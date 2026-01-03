import {
  ChecklistItem,
  Client,
  Employee,
  FeatureFlag,
  KPI,
  Lead,
  MarketEvent,
  MarketPortal,
  MarketOfferResult,
  OpportunityStatus,
  TrackedOpportunity,
  ServiceJob
} from '@core/entities/types';
import { AppSettings } from '@core/ports/repositories';
import { buildContainer } from '@infrastructure/container';
import { log } from '@shared/logger';
import { v4 as uuid } from 'uuid';

type Listener = (state: AppState) => void;

export interface AppState {
  ready: boolean;
  employee?: Employee;
  jobs: ServiceJob[];
  clients: Client[];
  kpis: KPI[];
  leads: Lead[];
  marketEvents: MarketEvent[];
  opportunities: TrackedOpportunity[];
  settings: AppSettings;
  flags?: FeatureFlag;
  syncing: boolean;
  error?: string;
}

let state: AppState = {
  ready: false,
  jobs: [],
  clients: [],
  kpis: [],
  leads: [],
  marketEvents: [],
  opportunities: [],
  syncing: false,
  settings: { theme: 'light', language: 'es', demoMode: true, accent: 'ocean', plan: 'FREE' }
};

const listeners = new Set<Listener>();
let containerPromise: ReturnType<typeof buildContainer> | null = null;

export function subscribe(listener: Listener) {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

function setState(partial: Partial<AppState>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l(state));
}

function startThemeTransition() {
  document.documentElement.classList.add('theme-transition');
  window.setTimeout(() => document.documentElement.classList.remove('theme-transition'), 220);
}

export async function initStore() {
  if (!containerPromise) containerPromise = buildContainer();
  const container = await containerPromise;
  const employee = await container.repos.employeeRepo.getEmployee('emp-1');
  const jobs = await container.repos.jobRepo.listJobsForEmployee('emp-1');
  const clients = await container.repos.clientRepo.list();
  const kpis = await container.repos.kpiRepo.listByEmployee('emp-1');
  const leads = await container.usecases.listLeads.execute();
  const settings = await container.repos.settingsRepo.getSettings();
  const flags = await container.repos.flagRepo.getPlan('emp-1');
  const marketEvents = await container.repos.marketEventRepo.list();
  const opportunities = await container.usecases.listTrackedOpportunities.execute();
  applyAccentClass(settings.accent);
  setState({ ready: true, employee, jobs, clients, kpis, leads, settings, flags, marketEvents, opportunities });
}

export async function startCheckIn(jobId: string) {
  const container = await containerPromise!;
  await container.usecases.startCheck.execute(jobId);
  setState({});
}

export async function stopCheckOut(jobId: string) {
  const container = await containerPromise!;
  try {
    await container.usecases.stopCheck.execute(jobId);
    const jobs = await container.repos.jobRepo.listJobsForEmployee('emp-1');
    setState({ jobs });
  } catch (error) {
    setState({ error: (error as Error).message });
  }
}

export async function addEvidence(jobId: string, photo: string, type: 'before' | 'after') {
  const container = await containerPromise!;
  await container.usecases.addPhoto.execute(jobId, photo, type);
}

export async function updateChecklist(jobId: string, checklist: ChecklistItem[]) {
  const container = await containerPromise!;
  await container.usecases.completeChecklist.execute(jobId, checklist);
}

export async function computeKpis(period: 'week' | 'month') {
  const container = await containerPromise!;
  const kpi = await container.usecases.computeKpis.execute('emp-1', period);
  const kpis = await container.repos.kpiRepo.listByEmployee('emp-1');
  setState({ kpis: [...kpis, kpi] });
}

export async function syncNow() {
  const container = await containerPromise!;
  setState({ syncing: true });
  await container.usecases.syncOps.execute();
  setState({ syncing: false });
}

export async function toggleTheme() {
  const container = await containerPromise!;
  const next: AppSettings['theme'] = state.settings.theme === 'light' ? 'dark' : 'light';
  const settings: AppSettings = { ...state.settings, theme: next };
  await container.repos.settingsRepo.saveSettings(settings);
  startThemeTransition();
  document.documentElement.classList.toggle('dark', next === 'dark');
  setState({ settings });
}

export async function setAccent(accent: AppSettings['accent']) {
  const container = await containerPromise!;
  const settings: AppSettings = { ...state.settings, accent };
  await container.repos.settingsRepo.saveSettings(settings);
  startThemeTransition();
  applyAccentClass(accent);
  setState({ settings });
}

function applyAccentClass(accent: AppSettings['accent']) {
  document.documentElement.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset');
  document.documentElement.classList.add(`theme-${accent}`);
}

export async function upgrade(plan: FeatureFlag['plan']) {
  const container = await containerPromise!;
  const flags = await container.usecases.upgrade.execute('emp-1', plan);
  const settings: AppSettings = { ...state.settings, plan };
  await container.repos.settingsRepo.saveSettings(settings);
  setState({ flags, settings });
}

export async function startTrial() {
  const container = await containerPromise!;
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const flags = await container.usecases.upgrade.execute('emp-1', 'PRO_EMPLOYEE');
  const settings: AppSettings = { ...state.settings, plan: 'PRO_EMPLOYEE', trialEndsAt };
  await container.repos.settingsRepo.saveSettings(settings);
  setState({ flags: { ...flags, trialEndsAt }, settings });
}

export async function importLead(leadId: string, clientId: string) {
  const container = await containerPromise!;
  await container.usecases.importLead.execute(leadId, 'emp-1', clientId);
  const jobs = await container.repos.jobRepo.listJobsForEmployee('emp-1');
  setState({ jobs });
}

export async function listLeads(filters?: { status?: Lead['status']; source?: string; type?: string }) {
  const container = await containerPromise!;
  const leads = await container.usecases.listLeads.execute(filters);
  setState({ leads });
}

export async function refreshLeads() {
  const container = await containerPromise!;
  const leads = await container.usecases.refreshLeads.execute();
  setState({ leads });
}

export async function saveLead(leadId: string) {
  const container = await containerPromise!;
  await container.usecases.saveLead.execute(leadId);
  const leads = await container.usecases.listLeads.execute();
  setState({ leads });
}

export async function discardLead(leadId: string) {
  const container = await containerPromise!;
  await container.usecases.discardLead.execute(leadId);
  const leads = await container.usecases.listLeads.execute();
  setState({ leads });
}

export async function convertLead(leadId: string) {
  const container = await containerPromise!;
  await container.usecases.convertLead.execute(leadId, 'emp-1');
  const [jobs, leads] = await Promise.all([
    container.repos.jobRepo.listJobsForEmployee('emp-1'),
    container.usecases.listLeads.execute()
  ]);
  setState({ jobs, leads });
}

export function clearError() {
  setState({ error: undefined });
}

export function getState() {
  return state;
}

export async function exportPdf(jobId: string) {
  const container = await containerPromise!;
  const blob = await container.usecases.exportPdf.execute(jobId);
  const url = URL.createObjectURL(blob);
  log('info', 'PDF generado', { url });
  window.open(url, '_blank');
}

export async function getEvidence(jobId: string) {
  const container = await containerPromise!;
  return container.repos.evidenceRepo.getByJob(jobId);
}

export async function getClient(clientId: string) {
  const container = await containerPromise!;
  return container.repos.clientRepo.getClient(clientId);
}

export async function listClients() {
  const container = await containerPromise!;
  const clients = await container.repos.clientRepo.list();
  setState({ clients });
  return clients;
}

export async function trackMarketEvent(event: {
  portal: MarketPortal;
  query?: string;
  location?: string | null;
  category?: string | null;
  outboundUrl: string;
  type?: MarketEvent['type'];
  resultId?: string;
  opportunityId?: string;
  statusFrom?: OpportunityStatus;
  statusTo?: OpportunityStatus;
}) {
  const container = await containerPromise!;
  const created: MarketEvent = {
    id: uuid(),
    type: event.type ?? 'portal_search_click',
    portal: event.portal,
    query: event.query ?? '',
    location: event.location ?? null,
    category: event.category ?? null,
    outboundUrl: event.outboundUrl,
    source: 'market',
    createdAt: new Date().toISOString(),
    resultId: event.resultId,
    opportunityId: event.opportunityId,
    statusFrom: event.statusFrom,
    statusTo: event.statusTo
  };
  await container.repos.marketEventRepo.add(created);
  const marketEvents = await container.repos.marketEventRepo.list();
  setState({ marketEvents });
  return created;
}

export async function listMarketEvents() {
  const container = await containerPromise!;
  const marketEvents = await container.repos.marketEventRepo.list();
  setState({ marketEvents });
  return marketEvents;
}

export async function clearMarketEvents() {
  const container = await containerPromise!;
  await container.repos.marketEventRepo.clear();
  setState({ marketEvents: [] });
}

export async function generateMarketResults(params: {
  query: string;
  location?: string;
  category?: string;
  portals: MarketPortal[];
}) {
  const container = await containerPromise!;
  return container.usecases.generateMarketResults.execute(params);
}

export async function includeMarketResult(result: MarketOfferResult) {
  const container = await containerPromise!;
  const { opportunity, duplicated } = await container.usecases.addTrackedOpportunity.execute({ result });
  const opportunities = await container.usecases.listTrackedOpportunities.execute();
  setState({ opportunities });
  if (!duplicated) {
    await trackMarketEvent({
      type: 'opportunity_added',
      portal: opportunity.portal,
      query: result.sourceQuery,
      location: result.location,
      category: result.category,
      outboundUrl: opportunity.outboundUrl,
      resultId: result.id,
      opportunityId: opportunity.id
    });
  }
  return { opportunity, duplicated };
}

export async function listOpportunities(filters?: { status?: OpportunityStatus; portal?: string }) {
  const container = await containerPromise!;
  const opportunities = await container.usecases.listTrackedOpportunities.execute(filters);
  setState({ opportunities });
  return opportunities;
}

export async function updateOpportunityStatus(id: string, status: OpportunityStatus) {
  const container = await containerPromise!;
  const current = state.opportunities.find((item) => item.id === id);
  const updated = await container.usecases.updateTrackedOpportunity.execute(id, { status });
  const opportunities = await container.usecases.listTrackedOpportunities.execute();
  setState({ opportunities });
  if (updated) {
    await trackMarketEvent({
      type: 'opportunity_status_changed',
      portal: updated.portal,
      outboundUrl: updated.outboundUrl,
      opportunityId: updated.id,
      statusFrom: current?.status,
      statusTo: status
    });
  }
  return updated;
}

export async function updateOpportunityNotes(id: string, notes: string) {
  const container = await containerPromise!;
  const updated = await container.usecases.updateTrackedOpportunity.execute(id, { notes });
  const opportunities = await container.usecases.listTrackedOpportunities.execute();
  setState({ opportunities });
  return updated;
}

export async function openOpportunity(id: string) {
  const container = await containerPromise!;
  const updated = await container.usecases.openTrackedOpportunity.execute(id);
  const opportunities = await container.usecases.listTrackedOpportunities.execute();
  setState({ opportunities });
  const target = updated ?? opportunities.find((item) => item.id === id);
  if (target) {
    await trackMarketEvent({
      type: 'opportunity_opened',
      portal: target.portal,
      outboundUrl: target.outboundUrl,
      opportunityId: target.id
    });
  }
  return updated;
}

export async function addClient(input: { name: string; address?: string; notes?: string }) {
  const container = await containerPromise!;
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `cli-${Math.random().toString(16).slice(2)}`;
  const client: Client = {
    id,
    name: input.name.trim(),
    address: input.address?.trim() || '',
    notes: input.notes?.trim() || ''
  };
  await container.repos.clientRepo.addClient(client);
  const clients = await container.repos.clientRepo.list();
  setState({ clients });
  return client;
}
