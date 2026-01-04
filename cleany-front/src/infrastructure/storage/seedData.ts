import demoData from '@shared/demoData';
import { demoJobPostings } from '@shared/demoJobPostings';

import { db } from './dexieClient';
import { Source } from '@core/entities/types';

export async function seedDatabase() {
  const count = await db.jobs.count();
  if (count > 0) {
    // Si ya hay datos de jobs, asegúrate de que las fuentes existen al menos
    await seedSourcesIfDemo();
    return;
  }
  try {
    await db.transaction(
      'rw',
      [db.jobs, db.clients, db.employees, db.evidences, db.leads, db.sessions, db.kpis, db.sources, db.jobPostings],
      async () => {
        await db.employees.bulkAdd(demoData.employees);
        await db.clients.bulkAdd(demoData.clients);
        await db.jobs.bulkAdd(demoData.jobs);
        await db.evidences.bulkAdd(demoData.evidences);
        await db.leads.bulkAdd(demoData.leads);
        await db.sessions.bulkAdd(demoData.sessions);
        await db.kpis.bulkAdd(demoData.kpis);
        await seedSourcesIfDemo();
        await seedDemoPostingsIfNeeded();
      }
    );
  } catch (error) {
    console.warn('Reiniciando base de datos local por error de seed', error);
    await db.delete();
    await db.open();
    await db.transaction(
      'rw',
      [db.jobs, db.clients, db.employees, db.evidences, db.leads, db.sessions, db.kpis, db.sources, db.jobPostings],
      async () => {
        await db.employees.bulkAdd(demoData.employees);
        await db.clients.bulkAdd(demoData.clients);
        await db.jobs.bulkAdd(demoData.jobs);
        await db.evidences.bulkAdd(demoData.evidences);
        await db.leads.bulkAdd(demoData.leads);
        await db.sessions.bulkAdd(demoData.sessions);
        await db.kpis.bulkAdd(demoData.kpis);
        await seedSourcesIfDemo();
        await seedDemoPostingsIfNeeded();
      }
    );
  }
}

async function seedSourcesIfDemo() {
  if ((demoData.settings?.demoMode ?? true) !== true) return;
  const sources: Source[] = [
    { id: 'rss-remoteok', name: 'RemoteOK', type: 'rss', url: 'https://remoteok.com/rss', isEnabled: true },
    { id: 'rss-wwr', name: 'WeWorkRemotely', type: 'rss', url: 'https://weworkremotely.com/categories/remote-programming-jobs.rss', isEnabled: true },
    { id: 'rss-remotive', name: 'Remotive', type: 'rss', url: 'https://remotive.com/remote-jobs/rss', isEnabled: true },
    { id: 'rss-workingnomads', name: 'WorkingNomads', type: 'rss', url: 'https://www.workingnomads.com/jobs.rss', isEnabled: true },
    { id: 'rss-tecnoempleo', name: 'Tecnoempleo', type: 'rss', url: 'https://www.tecnoempleo.com/busqueda-empleo.php?pr=1&format=rss', isEnabled: true },
    { id: 'manual', name: 'Manual', type: 'manual', isEnabled: true }
  ];
  await db.sources.bulkPut(sources);
}

async function seedDemoPostingsIfNeeded() {
  if ((demoData.settings?.demoMode ?? true) !== true) return;
  const existing = await db.jobPostings.count();
  if (existing > 0) return;
  await db.jobPostings.bulkPut(demoJobPostings);
}
