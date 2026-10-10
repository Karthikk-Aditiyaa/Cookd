import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/db';

export default function CountdownTimer() {
  const [running, setRunning] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [start, setStart] = useState<Date | null>(null);
  const [now, setNow] = useState(Date.now());
  const [balance, setBalance] = useState(0);

  useEffect(() => { refreshBalance(); }, []);
  async function refreshBalance() {
    const entries = await db.ledger.toArray();
    let bal = 0;
    for (const e of entries) {
      if (e.type === 'reward_earned') bal += e.seconds;
      if (e.type === 'free_time_spent') bal -= e.seconds;
    }
    setBalance(bal);
  }

  useEffect(() => {
    let int: number;
    if (running) int = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(int);
  }, [running]);

  const remaining = start ? Math.max(0, Math.floor(durationSec - (Date.now() - start.getTime()) / 1000)) : durationSec;
  const format = (s: number) => { const m = Math.floor(s/60); const sec = Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}`; };

  const handleStart = () => {
    if (balance <= 0) return;
    setStart(new Date());
    setRunning(true);
    setDurationSec(Math.floor(balance / 60) * 60);
  };

  const handleStop = async () => {
    setRunning(false);
    const spent = durationSec - remaining;
    if (spent > 0) {
      await db.ledger.add({ id: crypto.randomUUID(), timestamp: new Date(), type: 'free_time_spent', seconds: spent });
      await refreshBalance();
    }
    setStart(null);
    setDurationSec(0);
  };

  return (
    <div className="bg-[#0f1115] border border-white/[0.06] rounded-[24px] p-6 shadow-2xl backdrop-blur-sm">
      <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Free-Time Countdown</h2>
      <div className="text-6xl font-mono font-extrabold text-rose-300 tracking-tighter mb-6">{format(Math.max(0, remaining))}</div>
      <div className="flex gap-2 mb-4">
        {!running ? (
          <button onClick={handleStart} disabled={balance <= 0} className="px-6 py-3 bg-rose-500 hover:bg-rose-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-extrabold text-sm transition">Spend Free Time</button>
        ) : (
          <button onClick={handleStop} className="px-6 py-3 bg-[#f5c97a] hover:bg-amber-400 text-[#0b0c10] rounded-xl font-extrabold text-sm transition">Stop</button>
        )}
      </div>
      <p className="text-xs text-slate-500">Available balance: {Math.floor(balance/60)}m</p>
    </div>
  );
}
