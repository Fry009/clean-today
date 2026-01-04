import { JobPosting } from '@core/entities/types';

export const demoJobPostings: JobPosting[] = [
  {
    id: 'demo-remoteok-1',
    title: 'Limpieza oficinas (remoto coordinación)',
    company: 'Remote Clean Co',
    location: 'Madrid',
    province: 'Madrid',
    country: 'España',
    remoteType: 'onsite',
    salaryText: '12€/h',
    publishedAt: new Date().toISOString(),
    sourceName: 'Demo',
    sourceUrl: 'https://example.com/demo',
    applyUrl: 'https://example.com/apply/demo-remoteok-1',
    tags: ['limpieza', 'oficinas'],
    descriptionSnippet: 'Turno de mañana, 4h diarias. Contrato temporal.',
    createdAt: new Date().toISOString(),
    favorite: false
  },
  {
    id: 'demo-remoteok-2',
    title: 'Operario/a limpieza hotel',
    company: 'Hotel Centro',
    location: 'Barcelona',
    province: 'Barcelona',
    country: 'España',
    remoteType: 'onsite',
    salaryText: '1.200€ / mes',
    publishedAt: new Date().toISOString(),
    sourceName: 'Demo',
    sourceUrl: 'https://example.com/demo',
    applyUrl: 'https://example.com/apply/demo-remoteok-2',
    tags: ['hotel', 'limpieza'],
    descriptionSnippet: 'Jornadas rotativas. Incorporación inmediata.',
    createdAt: new Date().toISOString(),
    favorite: false
  },
  {
    id: 'demo-remoteok-3',
    title: 'Supervisor/a de limpieza',
    company: 'Facility Services',
    location: 'Valencia',
    province: 'Valencia',
    country: 'España',
    remoteType: 'hybrid',
    salaryText: '1.400€ / mes',
    publishedAt: new Date().toISOString(),
    sourceName: 'Demo',
    sourceUrl: 'https://example.com/demo',
    applyUrl: 'https://example.com/apply/demo-remoteok-3',
    tags: ['supervision', 'coordinacion'],
    descriptionSnippet: 'Gestión de equipos y rutas. Experiencia previa requerida.',
    createdAt: new Date().toISOString(),
    favorite: false
  }
];
