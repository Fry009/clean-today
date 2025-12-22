import { Badge, CheckInSession, Client, Employee, Evidence, KPI, Lead, ServiceJob } from '@core/entities/types';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

const euro = (amount: number) => ({ amount, currency: 'EUR' as const });

const badges: Badge[] = [
  { id: 'fast', label: 'Rápido', description: 'Termina a tiempo', color: 'green' },
  { id: 'trust', label: 'Confiable', description: 'Sin incidencias', color: 'blue' },
  { id: 'mentor', label: 'Mentor', description: 'Ayuda a otros', color: 'yellow' }
];

const employees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Ana Campos',
    avatar: 'https://i.pravatar.cc/150?img=47',
    level: 3,
    ratingAvg: 4.7,
    badges,
    premiumStatus: 'FREE'
  }
];

const clients: Client[] = [
  { id: 'cli-1', name: 'Familia García', address: 'C/ Mayor 12, Madrid', notes: 'Perro pequeño' },
  { id: 'cli-2', name: 'Oficina Centro', address: 'Gran Vía 23, Madrid', notes: 'Reponer café' },
  { id: 'cli-3', name: 'Clínica Norte', address: 'Av. Norte 8, Madrid', notes: 'Zona estéril' },
  { id: 'cli-4', name: 'Reforma ático', address: 'C/ Serrano 88, Madrid', notes: 'Pintura reciente' },
  { id: 'cli-5', name: 'Coworking Sur', address: 'Paseo Sur 3, Madrid', notes: 'Prioridad salas' }
];

const jobs: ServiceJob[] = Array.from({ length: 10 }).map((_, idx) => ({
  id: `job-${idx + 1}`,
  clientId: clients[idx % clients.length].id,
  employeeId: 'emp-1',
  type: idx % 3 === 0 ? 'oficina' : idx % 2 === 0 ? 'obra' : 'hogar',
  scheduledAt: dayjs().add(idx - 2, 'day').toISOString(),
  status: idx < 3 ? 'done' : idx === 8 ? 'canceled' : 'pending',
  price: euro(35 + idx * 5),
  durationEstimate: 60 + idx * 10,
  notes: idx === 2 ? 'Revisar cristales' : ''
}));

const evidences: Evidence[] = jobs.slice(0, 5).map((job) => ({
  jobId: job.id,
  beforePhotos: [`https://picsum.photos/seed/${job.id}-before/200`],
  afterPhotos: [`https://picsum.photos/seed/${job.id}-after/200`],
  checklist: [
    { id: 'floor', label: 'Suelos', done: true, required: true },
    { id: 'bath', label: 'Baños', done: job.id !== 'job-2', required: true },
    { id: 'kitchen', label: 'Cocina', done: true }
  ],
  comments: 'Sin incidencias'
}));

const sessions: CheckInSession[] = jobs.slice(0, 3).map((job, i) => ({
  jobId: job.id,
  startedAt: dayjs(job.scheduledAt).toISOString(),
  endedAt: dayjs(job.scheduledAt).add(80 + i * 5, 'minute').toISOString(),
  timerEvents: [
    { label: 'start', startedAt: dayjs(job.scheduledAt).toISOString() },
    {
      label: 'stop',
      startedAt: dayjs(job.scheduledAt).toISOString(),
      endedAt: dayjs(job.scheduledAt).add(80 + i * 5, 'minute').toISOString()
    }
  ]
}));

const kpis: KPI[] = [
  {
    employeeId: 'emp-1',
    period: 'week',
    jobsDone: 5,
    avgTime: 78,
    avgRating: 4.7,
    recurringRate: 0.4,
    cancellations: 1,
    revenue: 380,
    distanceKm: 24
  }
];

const leads: Lead[] = [
  {
    id: uuid(),
    source: 'milanuncios',
    url: 'https://www.milanuncios.com/servicios-limpieza/ciudad-lineal.htm',
    title: 'Limpieza hogar 90m² Ciudad Lineal',
    description: 'Mantenimiento semanal, incluye cristales y cocina',
    location: 'Madrid',
    price: euro(45),
    distanceKm: 2.1,
    postedHoursAgo: 3,
    type: 'hogar',
    status: 'unhandled',
    createdAt: dayjs().subtract(3, 'hour').toISOString()
  },
  {
    id: uuid(),
    source: 'jobtoday',
    url: 'https://jobtoday.com/es/trabajo/oficina-limpieza',
    title: 'Oficina 300m² Gran Vía',
    description: '2 veces por semana, horario tarde',
    location: 'Madrid Centro',
    price: euro(210),
    distanceKm: 1.3,
    postedHoursAgo: 6,
    type: 'oficina',
    status: 'unhandled',
    createdAt: dayjs().subtract(6, 'hour').toISOString()
  },
  {
    id: uuid(),
    source: 'indeed',
    url: 'https://indeed.com/obra-limpieza',
    title: 'Limpieza fin de obra loft',
    description: '1 jornada completa, materiales incluidos',
    location: 'Chamberí, Madrid',
    price: euro(120),
    distanceKm: 4.5,
    postedHoursAgo: 10,
    type: 'obra',
    status: 'saved',
    createdAt: dayjs().subtract(10, 'hour').toISOString()
  },
  {
    id: uuid(),
    source: 'domestiko',
    url: 'https://domestiko.es/anuncio/limpieza-chalet',
    title: 'Chalet 180m² Majadahonda',
    description: '3h semanales, jueves',
    location: 'Majadahonda',
    price: euro(65),
    distanceKm: 16,
    postedHoursAgo: 22,
    type: 'hogar',
    status: 'unhandled',
    createdAt: dayjs().subtract(22, 'hour').toISOString()
  }
];

export default {
  employees,
  clients,
  jobs,
  evidences,
  sessions,
  kpis,
  leads
};
