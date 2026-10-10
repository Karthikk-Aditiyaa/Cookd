import type { Session, LedgerEntry, Settings } from './types';

export function computeLedger(sessions: Session[], settings: Settings): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  let debtSec = 0;
  let balanceSec = 0;

  // Sort by startedAt
  const sorted = [...sessions].sort((a,b) => a.startedAt.getTime() - b.startedAt.getTime());

  for (const s of sorted) {
    if (s.category === 'productive') {
      const workSec = s.durationSec;
      if (settings.enableDebtRepayment && debtSec > 0) {
        const repaid = Math.min(debtSec, workSec);
        if (repaid > 0) {
          entries.push({ id: crypto.randomUUID(), timestamp: s.startedAt, sessionId: s.id, type: 'debt_repaid', seconds: repaid });
          debtSec -= repaid;
        }
        const leftover = workSec - repaid;
        if (leftover > 0) {
          const rewardSec = Math.round(leftover * (settings.rewardFreeMin / settings.rewardWorkMin));
          entries.push({ id: crypto.randomUUID(), timestamp: s.startedAt, sessionId: s.id, type: 'reward_earned', seconds: rewardSec });
          balanceSec += rewardSec;
        }
      } else {
        // No debt repayment: all productive time earns reward
        const rewardSec = Math.round(workSec * (settings.rewardFreeMin / settings.rewardWorkMin));
        entries.push({ id: crypto.randomUUID(), timestamp: s.startedAt, sessionId: s.id, type: 'reward_earned', seconds: rewardSec });
        balanceSec += rewardSec;
      }
    } else if (s.category === 'unproductive') {
      const debtInc = Math.round(s.durationSec * settings.penaltyMultiplier);
      entries.push({ id: crypto.randomUUID(), timestamp: s.startedAt, sessionId: s.id, type: 'debt_incurred', seconds: debtInc });
      debtSec += debtInc;
    }
  }

  // Add free-time-spent entries (from separate countdown tracking, handled in UI/DB)
  return entries;
}

export function computeBalances(entries: LedgerEntry[]): { balanceSec: number; debtSec: number; earnedSec: number; spentSec: number } {
  let balanceSec = 0, debtSec = 0, earnedSec = 0, spentSec = 0;
  for (const e of entries) {
    if (e.type === 'reward_earned') { balanceSec += e.seconds; earnedSec += e.seconds; }
    if (e.type === 'debt_incurred') { debtSec += e.seconds; }
    if (e.type === 'debt_repaid') { debtSec -= e.seconds; balanceSec -= (e.seconds / 1); /* debt repayment removes obligation */ }
    if (e.type === 'free_time_spent') { balanceSec -= e.seconds; spentSec += e.seconds; }
  }
  return { balanceSec, debtSec, earnedSec, spentSec };
}
