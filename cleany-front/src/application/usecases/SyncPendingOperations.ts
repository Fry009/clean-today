import { OutboxRepository } from '@core/ports/repositories';
import { RemoteSyncPort } from '@core/ports/sync';

export class SyncPendingOperations {
  constructor(
    private readonly outbox: OutboxRepository,
    private readonly remote: RemoteSyncPort
  ) {}

  async execute(): Promise<void> {
    const items = await this.outbox.list();
    for (const item of items) {
      try {
        await this.remote.push(item);
        await this.outbox.remove(item.id);
      } catch (error) {
        console.warn('Sync failed', error);
        break;
      }
    }
  }
}
