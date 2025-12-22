import { SyncPendingOperations } from '@application/usecases/SyncPendingOperations';
import { OutboxRepository, PendingOperation } from '@core/ports/repositories';
import { RemoteSyncPort } from '@core/ports/sync';

class MemoryOutbox implements OutboxRepository {
  items: PendingOperation[] = [];
  enqueue(operation: PendingOperation): Promise<void> {
    this.items.push(operation);
    return Promise.resolve();
  }
  list(): Promise<PendingOperation[]> {
    return Promise.resolve(this.items);
  }
  remove(id: string): Promise<void> {
    this.items = this.items.filter((i) => i.id !== id);
    return Promise.resolve();
  }
}

class MemoryRemote implements RemoteSyncPort {
  processed: PendingOperation[] = [];
  async push(operation: PendingOperation): Promise<void> {
    this.processed.push(operation);
  }
}

describe('SyncPendingOperations', () => {
  it('pushes and cleans outbox', async () => {
    const outbox = new MemoryOutbox();
    await outbox.enqueue({
      id: '1',
      type: 'SYNC_SESSION',
      payload: { jobId: '1' },
      createdAt: new Date().toISOString()
    });
    const remote = new MemoryRemote();
    const usecase = new SyncPendingOperations(outbox, remote);
    await usecase.execute();
    const remaining = await outbox.list();
    expect(remote.processed.length).toBe(1);
    expect(remaining.length).toBe(0);
  });
});
