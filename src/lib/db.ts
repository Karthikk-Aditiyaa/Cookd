import Dexie, { type Table } from 'dexie';
import type { Session, LedgerEntry, Override, Settings, Category } from './types';

class TimeLedgerDB extends Dexie {
  sessions!: Table<Session, string>;
  ledger!: Table<LedgerEntry, string>;
  overrides!: Table<Override, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super('TimeLedgerDB');
    this.version(1).stores({
      sessions: 'id, taskKey, startedAt, endedAt, category, source',
      ledger: 'id, timestamp, sessionId, type, seconds',
      overrides: 'taskKey',
      settings: 'id',
    });
  }
}

export const db = new TimeLedgerDB();

export async function initDB(): Promise<void> {
  const existing = await db.settings.get('default');
  if (!existing) {
    await db.settings.put({
      id: 'default',
      rewardWorkMin: 25,
      rewardFreeMin: 5,
      penaltyMultiplier: 5,
      keywordLists: {
        productive: ['study','code','work','write','read','exercise','project','learn','clean','meeting'],
        unproductive: ['scroll','youtube','netflix','games','social media','instagram','reddit','nap','doomscroll'],
      },
      askConfirmation: true,
      enableDebtRepayment: false,
    } as Settings);
  }
}
