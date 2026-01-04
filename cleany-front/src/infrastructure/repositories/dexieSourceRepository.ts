import { Source } from '@core/entities/types';
import { SourceRepository } from '@core/ports/repositories';
import { db } from '../storage/dexieClient';

export class DexieSourceRepository implements SourceRepository {
  async listEnabled(): Promise<Source[]> {
    const all = await db.sources.toArray();
    return all.filter((s) => s.isEnabled);
  }

  async upsert(source: Source): Promise<void> {
    await db.sources.put(source);
  }

  async disable(sourceId: string): Promise<void> {
    await db.sources.update(sourceId, { isEnabled: false });
  }
}
