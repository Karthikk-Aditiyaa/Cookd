import { useState, useEffect } from 'react';
import { db, initDB } from '../lib/db';
import { computeBalances } from '../lib/ledger';

export default function Header() {
  const [balance, setBalance] = useState(0);
  const [debt, setDebt] = useState(0);

  useEffect(() => { initDB(); refresh(); }, []);

  async function refresh() {
    const s = await db.sessions.toArray();
    const settings = await db.settings.get('default');
    const entries = await db.ledger.toArray();
    const { balanceSec, debtSec } = computeBalances(entries);
    setBalance(Math.floor(balanceSec/60));
    setDebt(Math.floor(debtSec/60));
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0b0c10]/80 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="logo text-3xl font-normal italic text-[#f5c97a] tracking-tight leading-none">Cookd</h1>
        <div className="flex items-center gap-4 text-sm font-mono">
          <span className="text-[#7ee787] bg-emerald-950/40 px-2.5 py-1 rounded-md">Balance: <b className="text-white">{balance}m</b></span>
          <span className="text-[#f6a0a0] bg-rose-950/40 px-2.5 py-1 rounded-md">Debt: <b className="text-white">{debt}m</b></span>
        </div>
      </div>
    </header>
  );
}
