import { useEffect, useState } from 'react';
import { db, initDB } from '../lib/db';

export default function Settings() {
  const [s, setS] = useState<any>(null);
  useEffect(() => { initDB(); db.settings.get('default').then(setS); }, []);

  const importData = async (e: any) => { const file = e.target.files?.[0]; if (!file) return; const text = await file.text(); const data = JSON.parse(text); await db.sessions.clear(); await db.ledger.clear(); await db.overrides.clear(); if (data.sessions) await db.sessions.bulkAdd(data.sessions); if (data.ledger) await db.ledger.bulkAdd(data.ledger); if (data.overrides) await db.overrides.bulkAdd(data.overrides); window.location.reload(); };
  const save = async () => { if (s) { s.id = 'default'; await db.settings.put(s); } };
  const demoData = async () => {
    const tasks = ['code review', 'scroll youtube', 'study math', 'write notes', 'netflix', 'exercise', 'project work', 'social media'];
    for (let d = 0; d < 14; d++) {
      const base = new Date(); base.setDate(base.getDate() - d);
      for (let i = 0; i < 3; i++) {
        const start = new Date(base); start.setHours(9 + i, 0, 0);
        const dur = 900 + Math.random() * 900;
        const cat = Math.random() > 0.3 ? 'productive' : 'unproductive';
        await db.sessions.add({ id: crypto.randomUUID(), taskName: tasks[Math.floor(Math.random()*tasks.length)], taskKey: tasks[Math.floor(Math.random()*tasks.length)].toLowerCase(), startedAt: start, endedAt: new Date(start.getTime()+dur*1000), durationSec: Math.round(dur), category: cat as any, source: 'stopwatch' });
      }
    }
    window.location.reload();
  };

  const exportData = async () => {
    const obj = { sessions: await db.sessions.toArray(), ledger: await db.ledger.toArray(), overrides: await db.overrides.toArray(), settings: await db.settings.toArray() };
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'timeledger-backup.json'; a.click();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-white">Settings</h2>
      <div className="bg-slate-900/40 border border-slate-700/40 rounded-2xl p-6 space-y-4">
        <div><label className="text-xs uppercase text-slate-400 font-bold">Reward Work Min</label><input type="number" value={s?.rewardWorkMin || 25} onChange={e => setS({...s, rewardWorkMin: +e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white" /></div>
        <div><label className="text-xs uppercase text-slate-400 font-bold">Penalty Multiplier</label><input type="number" value={s?.penaltyMultiplier || 5} onChange={e => setS({...s, penaltyMultiplier: +e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white" /></div>
        <button onClick={save} className="px-6 py-2 bg-[#f5c97a] text-[#0b0c10] rounded-xl font-extrabold text-sm">Save Settings</button>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <button onClick={demoData} className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-2xl text-left hover:bg-slate-800/40 transition"><h4 className="font-extrabold text-white">Load Demo Data</h4><p className="text-xs text-slate-500">Populate 2 weeks</p></button>
        <label className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-2xl text-left hover:bg-slate-800/40 transition block cursor-pointer"><h4 className="font-extrabold text-white">Import JSON</h4><p className="text-xs text-slate-500 mb-2">Restore backup</p><input type="file" accept=".json" onChange={importData} className="text-xs text-slate-400 block w-full" /></label>
        <label className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-2xl text-left hover:bg-slate-800/40 transition block"><h4 className="font-extrabold text-white">Import JSON</h4><p className="text-xs text-slate-500 mb-2">Restore backup</p><input type="file" accept=".json" onChange={importData} className="text-xs text-slate-400" /></label>
        <button onClick={exportData} className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-2xl text-left hover:bg-slate-800/40 transition"><h4 className="font-extrabold text-white">Export JSON</h4><p className="text-xs text-slate-500">Full backup</p></button>
      </div>
    </div>
  );
}
