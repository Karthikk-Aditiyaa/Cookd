import { useEffect, useState } from 'react';
import { db, initDB } from '../lib/db';

export default function Rankings() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { initDB(); load(); }, []);
  async function load() {
    const sessions = await db.sessions.toArray();
    const agg: Record<string, { sec: number, count: number, cat: string }> = {};
    for (const s of sessions) {
      if (!agg[s.taskKey]) agg[s.taskKey] = { sec: 0, count: 0, cat: s.category };
      agg[s.taskKey].sec += s.durationSec;
      agg[s.taskKey].count += 1;
    }
    setItems(Object.entries(agg).map(([k, v]) => ({ task: k, sec: v.sec, count: v.count, cat: v.cat })).sort((a,b) => b.sec - a.sec));
  }
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-white">Rankings</h2>
      <div className="bg-slate-900/40 border border-slate-700/40 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 text-slate-400 text-xs uppercase font-bold"><tr><th className="text-left p-4">Task</th><th className="text-right p-4">Time</th><th className="text-right p-4">Sessions</th></tr></thead>
          <tbody className="divide-y divide-slate-700/40">
            {items.map((i, idx) => (
              <tr key={i.task} className="hover:bg-slate-800/20 transition">
                <td className="p-4 font-bold text-white">{i.task}</td>
                <td className="p-4 text-right font-mono text-[#f5c97a]">{Math.round(i.sec/60)}m</td>
                <td className="p-4 text-right font-mono text-slate-400">{i.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
