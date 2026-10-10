import Dexie, { type Table } from 'dexie';
import type { Session, ActiveTimer, FreeTimeSpent, Override, OutboxItem } from './types-v2';

class TimeLedgerDB extends Dexie {
  sessions!: Table<Session, string>;
  activeTimers!: Table<ActiveTimer, string>;
  freeTimeSpent!: Table<FreeTimeSpent, string>;
  overrides!: Table<Override, string>;
  outbox!: Table<OutboxItem, string>;

  constructor() {
    super('TimeLedgerDB_v2');
    this.version(2).stores({
      sessions: 'id, taskKey, startedAt, deletedAt, deviceId, status',
      activeTimers: 'id, kind, deletedAt, deviceId',
      freeTimeSpent: 'id, deviceId, deletedAt',
      overrides: 'taskKey, deviceId, deletedAt',
      outbox: 'id, table, createdAt',
    });
  }
}
export const db = new TimeLedgerDB();
