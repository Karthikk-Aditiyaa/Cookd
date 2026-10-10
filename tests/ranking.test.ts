import { describe, it, expect } from 'vitest';

function aggregate(sessions: any[]) {
  const agg: Record<string, { sec: number, count: number, cat: string }> = {};
  for (const s of sessions) {
    if (!agg[s.taskKey]) agg[s.taskKey] = { sec: 0, count: 0, cat: s.category };
    agg[s.taskKey].sec += s.durationSec;
    agg[s.taskKey].count += 1;
  }
  return Object.entries(agg).map(([k, v]) => ({ task: k, sec: v.sec, count: v.count, cat: v.cat })).sort((a,b) => b.sec - a.sec);
}

describe('ranking aggregation', () => {
  it('sorts by total time', () => {
    const s = [
      { id: '1', taskKey: 'a', durationSec: 100, category: 'productive' },
      { id: '2', taskKey: 'b', durationSec: 500, category: 'unproductive' },
    ];
    const r = aggregate(s);
    expect(r[0].task).toBe('b');
    expect(r[0].sec).toBe(500);
  });
});
