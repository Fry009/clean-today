import { MarketOfferResult, MarketPortal } from '@core/entities/types';
import { buildPortalSearchUrl } from '@shared/market/portalUrlBuilders';
import { v4 as uuid } from 'uuid';

type Params = {
  query: string;
  location?: string;
  category?: string;
  portals: MarketPortal[];
  perPortal?: number;
};

const TITLE_TEMPLATES: Record<MarketPortal, string[]> = {
  milanuncios: [
    'Se busca {query} en {location}',
    'Oferta limpieza hogar {location}',
    'Auxiliar limpieza oficinas {location}',
    'Servicio urgente {query}',
    'Turno manana {query} {location}'
  ],
  infojobs: [
    '{query} con experiencia',
    'Vacante {query} - {location}',
    'Personal de limpieza {location}',
    'Refuerzo fin de semana {location}',
    'Equipo {query} disponible'
  ],
  indeed: [
    '{query} jornada completa',
    'Media jornada {location}',
    'Contrato temporal {query}',
    'Limpieza por horas {location}',
    'Operario/a limpieza {location}'
  ],
  linkedin: [
    '{query} - empresa destacada',
    'Rol de {query} en {location}',
    'Limpieza corporativa {location}',
    'Facility services {location}',
    'Incorporacion inmediata {query}'
  ]
};

const PRICE_PRESETS: Record<MarketPortal, Array<string | null>> = {
  milanuncios: ['12€ / h', '45€ por servicio', '60€ pack 3h', null],
  infojobs: ['1.050€ / mes', '14.000€ bruto anual', '12€ / h', null],
  indeed: ['1.180€ / mes', '11€ / h', '1.300€ bruto anual', null],
  linkedin: ['1.250€ / mes', 'Pago por proyecto', null, '12€ / h']
};

export class GenerateMarketResults {
  execute(params: Params): MarketOfferResult[] {
    const query = params.query.trim() || 'limpieza';
    const location = params.location?.trim() || 'Espana';
    const category = params.category?.trim() || null;
    const perPortal = params.perPortal ?? 5;

    const portals = Array.from(new Set(params.portals));
    const now = Date.now();

    return portals.flatMap((portal, portalIndex) => {
      const outboundUrl = buildPortalSearchUrl(portal, { query, location, category: category ?? undefined });
      const titles = TITLE_TEMPLATES[portal] ?? TITLE_TEMPLATES.milanuncios;
      const prices = PRICE_PRESETS[portal] ?? PRICE_PRESETS.milanuncios;

      return Array.from({ length: perPortal }).map((_, idx) => {
        const titleTemplate = titles[(idx + portalIndex) % titles.length];
        const title = titleTemplate.replace('{query}', query).replace('{location}', location);
        const price = prices[(idx + portalIndex) % prices.length];
        const createdAt = new Date(now - (portalIndex * 4 + idx) * 60 * 60 * 1000).toISOString();
        return {
          id: uuid(),
          portal,
          title,
          location,
          category,
          priceOrSalary: price,
          createdAt,
          outboundUrl,
          sourceQuery: query
        };
      });
    });
  }
}
