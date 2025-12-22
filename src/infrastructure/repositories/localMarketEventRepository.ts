import { MarketEvent, MarketPortal } from '@core/entities/types';
import { MarketEventRepository } from '@core/ports/repositories';

import { db } from '../storage/dexieClient';

export class LocalMarketEventRepository implements MarketEventRepository {
  async add(event: MarketEvent): Promise<void> {
    await db.marketEvents.put(event);
  }

  async list(): Promise<MarketEvent[]> {
    return db.marketEvents.orderBy('createdAt').reverse().toArray();
  }

  async clear(): Promise<void> {
    await db.marketEvents.clear();
  }
}
