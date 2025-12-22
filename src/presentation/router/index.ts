import '../pages/home-page';
import '../pages/jobs-page';
import '../pages/job-detail-page';
import '../pages/evidence-page';
import '../pages/kpis-page';
import '../pages/profile-page';
import '../pages/leads-page';
import '../pages/premium-page';
import '../pages/history-page';
import '../pages/clients-page';
import '../pages/help-page';
import '../pages/settings-page';
import '../pages/calendar-page';
import '../pages/market-page';

import { Router } from '@vaadin/router';

export function createRouter(outlet: Element) {
  const router = new Router(outlet);
  router.setRoutes([
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: 'home-page' },
    { path: '/calendar', component: 'calendar-page' },
    { path: '/market', component: 'market-page' },
    { path: '/jobs', component: 'jobs-page' },
    { path: '/jobs/:id', component: 'job-detail-page' },
    { path: '/jobs/:id/evidence', component: 'evidence-page' },
    { path: '/kpis', component: 'kpis-page' },
    { path: '/profile', component: 'profile-page' },
    { path: '/leads', component: 'leads-page' },
    { path: '/premium', component: 'premium-page' },
    { path: '/history', component: 'history-page' },
    { path: '/clients', component: 'clients-page' },
    { path: '/settings', component: 'settings-page' },
    { path: '/help', component: 'help-page' }
  ]);
  return router;
}
