import { OutboxRepository, PendingOperation } from '@core/ports/repositories';

import { db } from '../storage/dexieClient';

export class OutboxDexieRepository implements OutboxRepository {
  async enqueue(operation: PendingOperation): Promise<void> {
    await db.outbox.put(operation);
  }

  async list(): Promise<PendingOperation[]> {
    return db.outbox.toArray();
  }

  async remove(id: string): Promise<void> {
    await db.outbox.delete(id);
  }
}
