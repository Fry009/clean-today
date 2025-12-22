import { MarketPortal } from '@core/entities/types';

type SearchParams = { query: string; location?: string; category?: string };

const normalize = (value: string) => value.trim();

const combineTerms = (query: string, category?: string, location?: string) => {
  const base = normalize(query);
  const parts = [base];
  if (category && category !== 'anuncios') parts.push(category);
  if (location) parts.push(location);
  return parts.filter(Boolean).join(' ').trim();
};

export function buildPortalSearchUrl(portal: MarketPortal, params: SearchParams) {
  const query = normalize(params.query || '');
  const location = params.location?.trim();
  const category = params.category?.trim();
  const keyword = combineTerms(query, category, location);
  const def = portalDefinitions.find((p) => p.key === portal);
  const site = def?.domain ?? '';
  const search = [`site:${site}`, keyword].filter(Boolean).join(' ');
  const url = new URL('https://www.google.com/search');
  url.searchParams.set('q', search);
  return url.toString();
}

export const portalDefinitions: Array<{
  key: MarketPortal;
  name: string;
  description: string;
  domain: string;
}> = [
  { key: 'milanuncios', name: 'Milanuncios', description: 'Clasificados y anuncios locales', domain: 'milanuncios.com' },
  { key: 'infojobs', name: 'InfoJobs', description: 'Ofertas de empleo y servicios', domain: 'infojobs.net' },
  { key: 'indeed', name: 'Indeed', description: 'Buscador global de empleo (ES)', domain: 'indeed.com' },
  { key: 'linkedin', name: 'LinkedIn Jobs', description: 'Red profesional y ofertas', domain: 'linkedin.com/jobs' }
];
