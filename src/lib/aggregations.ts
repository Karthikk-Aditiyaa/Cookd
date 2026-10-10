import type { Session } from './types';
export function averageFocusTime(sessions: Session[]): number {
  if (!sessions.length) return 0;
  return Math.round(sessions.reduce((a,b) => a + b.durationSec, 0) / sessions.length);
}
