import { Lead } from '@core/entities/types';
import { LeadRepository } from '@core/ports/repositories';
import { v4 as uuid } from 'uuid';

const euro = (amount: number) => ({ amount, currency: 'EUR' as const });

export class RefreshLeads {
  constructor(private readonly repo: LeadRepository) {}

  async execute(): Promise<Lead[]> {
    const injected: Lead[] = [
      {
        id: uuid(),
        source: 'milanuncios',
        title: 'Servicio express - Retiro',
        description: 'Limpieza puntual 3h, hoy 18:00',
        url: 'https://milanuncios.com/servicio-express',
        location: 'Parque del Retiro, Madrid',
        price: euro(60),
        distanceKm: 1.1,
        postedHoursAgo: 1,
        type: 'hogar',
        status: 'unhandled',
        createdAt: new Date().toISOString()
      },
      {
        id: uuid(),
        source: 'indeed',
        title: 'Oficina 150m² Castellana',
        description: '2 días/semana, horario mañana',
        url: 'https://indeed.com/oficina-castellana',
        location: 'Paseo de la Castellana, Madrid',
        price: euro(130),
        distanceKm: 3.4,
        postedHoursAgo: 2,
        type: 'oficina',
        status: 'unhandled',
        createdAt: new Date().toISOString()
      }
    ];
    await this.repo.bulkSave(injected);
    return this.repo.list();
  }
}
