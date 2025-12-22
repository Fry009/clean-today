export type PremiumPlan = 'FREE' | 'PRO_EMPLOYEE' | 'PRO_TEAM';

export interface Money {
  amount: number;
  currency: 'EUR';
}

export interface Rating {
  value: number; // 0-5
  votes: number;
}

export interface Employee {
  id: string;
  name: string;
  avatar: string;
  level: number;
  ratingAvg: number;
  badges: Badge[];
  premiumStatus: PremiumPlan;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  color: string;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  notes: string;
}

export type JobType = 'hogar' | 'oficina' | 'obra';
export type JobStatus = 'pending' | 'in_progress' | 'done' | 'canceled';

export interface ServiceJob {
  id: string;
  clientId: string;
  employeeId: string;
  type: JobType;
  scheduledAt: string;
  status: JobStatus;
  price: Money;
  durationEstimate: number;
  notes?: string;
}

export interface CheckInSession {
  jobId: string;
  startedAt: string;
  endedAt?: string;
  geoStart?: string;
  geoEnd?: string;
  timerEvents: TimerEvent[];
}

export interface TimerEvent {
  label: string;
  startedAt: string;
  endedAt?: string;
}

export interface Evidence {
  jobId: string;
  beforePhotos: string[];
  afterPhotos: string[];
  checklist: ChecklistItem[];
  signature?: string;
  comments?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  required?: boolean;
}

export interface KPI {
  employeeId: string;
  period: string;
  jobsDone: number;
  avgTime: number;
  avgRating: number;
  recurringRate: number;
  cancellations: number;
  revenue: number;
  distanceKm: number;
}

export interface FeatureFlag {
  plan: PremiumPlan;
  enabledFeatures: string[];
  trialEndsAt?: string;
}

export interface Lead {
  id: string;
  source: LeadSource;
  title: string;
  description?: string;
  url: string;
  location: string;
  price: Money;
  distanceKm: number;
  postedHoursAgo: number;
  type: JobType;
  status: LeadStatus;
  saved?: boolean;
  notes?: string;
  createdAt: string;
}

export type LeadSource = 'milanuncios' | 'indeed' | 'jobtoday' | 'domestiko' | 'otros';
export type LeadStatus = 'unhandled' | 'saved' | 'discarded';
