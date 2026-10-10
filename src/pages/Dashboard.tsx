import { useEffect, useState } from 'react';
import { db, initDB } from '../lib/db';
import { computeBalances } from '../lib/ledger';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => { initDB(); load(); }, []);

  async function load() {
    const sessions = await db.sessions.toArray();
    const ledger = await db.ledger.toArray();
    const { balanceSec, debtSec, earnedSec, spentSec } = computeBalances(ledger);
    const avgDur = sessions.length ? Math.round(sessions.reduce((a,b) => a + b.durationSec, 0) / sessions.length) : 0;
    const productive = sessions.filter(s => s.category === 'productive').length;
    const unproductive = sessions.filter(s => s.category === 'unproductive').length;
    const totalProdSec = sessions.filter(s => s.category === 'productive').reduce((a,b) => a + b.durationSec, 0);
    const totalUnprodSec = sessions.filter(s => s.category === 'unproductive').reduce((a,b) => a + b.durationSec, 0);
    const ratio = totalProdSec + totalUnprodSec ? Math.round((totalProdSec / (totalProdSec + totalUnprodSec)) * 100) : 0;
    setData({ avgDur, productive, unproductive, ratio, balanceSec, debtSec, earnedSec, spentSec, totalProdSec, totalUnprodSec, count: sessions.length });
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-white">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-700/40 rounded-2xl p-5"><h4 className="text-xs text-slate-400 uppercase">Avg Focus</h4><p className="text-2xl font-extrabold text-[#f5c97a]">{data.avgDur ? Math.round(data.avgDur/60) + 'm' : '--'}</p></div>
        <div className="bg-slate-900/40 border border-slate-700/40 rounded-2xl p-5"><h4 className="text-xs text-slate-400 uppercase">Productive %</h4><p className="text-2xl font-extrabold text-[#7ee787]">{data.ratio ?? '--'}%</p></div>
        <div className="bg-slate-900/40 border border-slate-700/40 rounded-2xl p-5"><h4 className="text-xs text-slate-400 uppercase">Balance</h4><p className="text-2xl font-extrabold text-cyan-300">{data.balanceSec ? Math.floor(data.balanceSec/60) + 'm' : '--'}</p></div>
        <div className="bg-slate-900/40 border border-slate-700/40 rounded-2xl p-5"><h4 className="text-xs text-slate-400 uppercase">Debt</h4><p className="text-2xl font-extrabold text-rose-300">{data.debtSec ? Math.floor(data.debtSec/60) + 'm' : '--'}</p></div>
      </div>
      <div className="bg-slate-900/40 border border-slate-700/40 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Overview</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { name: 'Productive', value: data.totalProdSec || 0 },
            { name: 'Unproductive', value: data.totalUnprodSec || 0 },
          ]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
