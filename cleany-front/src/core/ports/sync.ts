import { PendingOperation } from './repositories';

export interface RemoteSyncPort {
  push(operation: PendingOperation): Promise<void>;
}
