export type Category = 'productive' | 'unproductive' | 'uncertain' | 'sleep';
export type Source = 'stopwatch' | 'manual' | 'timer';

export interface Session {
  id: string;
  taskName: string;
  taskKey: string;
  startedAt: Date;
  endedAt: Date | null;
  durationSec: number;
  category: Category;
  source: Source;
}

export interface LedgerEntry {
  id: string;
  timestamp: Date;
  sessionId?: string;
  type: 'reward_earned' | 'debt_incurred' | 'debt_repaid' | 'free_time_spent';
  seconds: number;
}

export interface Override {
  taskKey: string;
  category: 'productive' | 'unproductive';
}

export interface Settings {
  rewardWorkMin: number;
  rewardFreeMin: number;
  penaltyMultiplier: number;
  keywordLists: { productive: string[]; unproductive: string[] };
  askConfirmation: boolean;
  enableDebtRepayment: boolean;
}

export interface CountdownState {
  targetEnd: Date | null;
  startedAt: Date | null;
  originalDurationSec: number;
}
