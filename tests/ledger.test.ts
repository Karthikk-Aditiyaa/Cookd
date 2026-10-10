import { describe, it, expect } from 'vitest';
import { computeLedger } from '../src/lib/ledger';
import type { Session, Settings } from '../src/lib/types';

describe('ledger', () => {
  const settings: Settings = { rewardWorkMin: 25, rewardFreeMin: 5, penaltyMultiplier: 5, keywordLists: { productive: [], unproductive: [] }, askConfirmation: false, enableDebtRepayment: false };

  it('rewards only', () => {
    const s: Session = { id: '1', taskName: 'work', taskKey: 'work', startedAt: new Date(), endedAt: new Date(Date.now()+1500000), durationSec: 1500, category: 'productive', source: 'stopwatch' };
    const entries = computeLedger([s], settings);
    expect(entries.some(e => e.type === 'reward_earned')).toBe(true);
  });

  it('penalty only', () => {
    const s: Session = { id: '1', taskName: 'scroll', taskKey: 'scroll', startedAt: new Date(), endedAt: new Date(Date.now()+1500000), durationSec: 1500, category: 'unproductive', source: 'stopwatch' };
    const entries = computeLedger([s], settings);
    expect(entries.some(e => e.type === 'debt_incurred')).toBe(true);
  });
});
