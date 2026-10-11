import { useState, useEffect, useRef } from 'react';
import { db, initDB } from '../lib/db';
import SessionModal from '../components/SessionModal';

export default function Timer() {
  const [targetMin, setTargetMin] = useState<number | ''>('');
  const [targetSec, setTargetSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [targetReached, setTargetReached] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const tickRef = useRef(0);

  useEffect(() => { initDB(); }, []);

  useEffect(() => {
    let int: number;
    if (running) int = setInterval(() => setElapsed(Date.now() - startedAt!.getTime() / 1000), 100);
    return () => clearInterval(int);
  }, [running, startedAt]);

  const handleStart = () => {
    if (!targetMin || targetMin < 1) return;
    setTargetSec(Math.floor(+targetMin) * 60);
    setElapsed(0); setStartedAt(new Date()); setTargetReached(false);
    setRunning(true);
  };

  const handleStop = () => { setRunning(false); setModalOpen(true); };

  const saveSession = async (task: string, cat: string) => {
    const session = {
      id: crypto.randomUUID(), taskName: task,
      taskKey: task.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').substring(0,60),
      startedAt: startedAt || new Date(), endedAt: new Date(), durationSec: elapsed,
      category: cat as any, source: 'timer' as const,
    };
    await db.sessions.add(session);
    setRunning(false); setTargetMin(''); setElapsed(0); setStartedAt(null); setTargetReached(false); setModalOpen(false);
    window.location.reload();
  };

  const format = (s: number) => { const m = Math.floor(s/60); const sec = Math.floor(s%60); return `${m}:${sec.toString().padStart(2,'0')}`; };

  useEffect(() => {
    if (!running || targetReached) return;
    if (elapsed >= targetSec) {
      setTargetReached(true);
      // notify
      if (Notification?.permission === 'granted') new Notification('TimeTarget Reached', { body: `You studied for ${Math.round(+targetMin)} minutes.`, tag: 'time-target' });
    }
  }, [elapsed, targetSec, running, targetReached]);

  return (
    <div className="bg-[#0f1115] border border-white/[0.06] rounded-[24px] p-6">
      <h2 className="text-2xl font-bold text-white mb-2">Timer</h2>
      <p className="text-slate-500 text-sm mb-4">Set a study/work target; timer alerts when it is reached. Session earns reward (25m work = 5m free).</p>
      {running ? (
        <>
          <div className="text-6xl font-mono font-extrabold text-amber-300 mb-6">{format(elapsed)} / {format(targetSec)}</div>
          <div className="flex gap-2 mb-4">
            <button onClick={handleStop} className="px-6 py-3 bg-amber-500 text-slate-950 rounded-xl font-extrabold text-sm w-full">Stop & Log</button>
          </div>
          {targetReached && <div className="bg-amber-400 text-slate-950 rounded-xl px-4 py-3 font-bold mb-4 text-center">Target reached — stop to log session</div>}
        </>
      ) : (
        <>
          <input type="number" min="1" value={targetMin} onChange={e => setTargetMin(+e.target.value || '')} placeholder="Target in minutes (e.g. 50)" className="w-full bg-[#0b0c10] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-lg mb-4" />
          <button onClick={handleStart} disabled={!targetMin || targetMin < 1} className="px-6 py-3 bg-[#f5c97a] text-[#0b0c10] rounded-xl font-extrabold text-sm w-full disabled:bg-slate-700 disabled:text-slate-500">Start Timer</button>
        </>
      )}
      <SessionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={saveSession} defaultCategory={'productive'} />
    </div>
  );
}
