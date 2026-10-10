export type Category = 'productive' | 'unproductive' | 'uncertain';
export type Source = 'stopwatch' | 'manual';
export type SessionStatus = 'pending_description' | 'complete';

export interface Session {
  id: string;
  taskName: string;
  taskKey: string;
  startedAt: Date;
  endedAt: Date | null;
  durationSec: number;
  category: Category;
  status: SessionStatus;
  source: Source;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  schemaVersion: number;
}

export interface ActiveTimer {
  id: string;
  kind: 'stopwatch' | 'countdown';
  startedAt: Date;
  pausedAccumSec: number;
  pausedAt: Date | null;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface FreeTimeSpent {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  seconds: number;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface LedgerEntry {
  id: string;
  timestamp: Date;
  sessionId?: string;
  type: 'reward_earned' | 'debt_incurred' | 'debt_repaid' | 'free_time_spent';
  seconds: number;
  deviceId: string;
}

export interface Override {
  taskKey: string;
  category: 'productive' | 'unproductive';
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface OutboxItem {
  id: string;
  table: string;
  recordId: string;
  op: 'insert' | 'update' | 'delete';
  payload: any;
  attempts: number;
  lastError?: string;
  createdAt: Date;
}
