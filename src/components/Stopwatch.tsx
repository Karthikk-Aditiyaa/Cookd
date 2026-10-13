import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import SessionModal from './SessionModal';

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pausedAt, setPausedAt] = useState<Date | null>(null);
  const [accumulated, setAccumulated] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Restore persisted state on mount
  useEffect(() => {
    const saved = localStorage.getItem('timer_state');
    if (saved) {
      const state = JSON.parse(saved);
      setStartTime(state.startTime ? new Date(state.startTime) : null);
      setPausedAt(state.pausedAt ? new Date(state.pausedAt) : null);
      setAccumulated(state.accumulated || 0);
      setRunning(state.running || false);
    }
  }, []);

  // Tick only while running
  useEffect(() => {
    let interval: number;
    if (running) {
      interval = setInterval(() => setNow(Date.now()), 100);
    }
    return () => clearInterval(interval);
  }, [running]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('timer_state', JSON.stringify({ startTime, pausedAt, accumulated, running }));
  }, [startTime, pausedAt, accumulated, running]);

  function format(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  }

  // Compute elapsed from timestamps (never from setInterval ticks)
  const elapsed = running
    ? Math.floor((Date.now() - (startTime?.getTime() || 0)) / 1000) + accumulated - Math.floor((pausedAt ? (pausedAt.getTime() - (startTime?.getTime() || 0)) / 1000 : 0))
    : accumulated;

  const handleStop = () => {
    setRunning(false);
    setModalOpen(true);
  };

  const saveSession = async (task: string, category: string) => {
    const session = {
      id: crypto.randomUUID(),
      taskName: task,
      taskKey: task.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').substring(0,60),
      startedAt: startTime || new Date(),
      endedAt: new Date(),
      durationSec: elapsed,
      category: category as 'productive' | 'unproductive' | 'uncertain' | 'sleep',
      source: 'stopwatch' as const,
    };
    await db.sessions.add(session);
    localStorage.removeItem('timer_state');
    setRunning(false);
    setStartTime(null);
    setPausedAt(null);
    setAccumulated(0);
    setModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="bg-[#0f1115] border border-white/[0.06] rounded-[24px] p-6 shadow-2xl backdrop-blur-sm">
      <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Stopwatch</h2>
      <div className="text-6xl font-mono font-extrabold text-[#f5c97a] tracking-tighter mb-6">{format(Math.max(0, elapsed))}</div>
      <div className="flex gap-2 mb-4">
        {!startTime && !running ? (
          <button
            onClick={() => { setStartTime(new Date()); setRunning(true); setAccumulated(0); setPausedAt(null); }}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0b0c10] rounded-xl font-extrabold text-sm transition"
          >Start</button>
        ) : running ? (
          <>
            <button
              onClick={() => { setPausedAt(new Date()); setRunning(false); }}
              className="px-6 py-3 bg-[#f5c97a] text-[#0b0c10] rounded-xl font-extrabold text-sm transition"
            >Pause</button>
            <button
              onClick={handleStop}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-extrabold text-sm transition"
            >Stop</button>
          </>
        ) : (
          <>
            <button
              onClick={() => { setRunning(true); setPausedAt(null); }}
              className="px-6 py-3 bg-[#f5c97a] text-[#0b0c10] rounded-xl font-extrabold text-sm transition"
            >Resume</button>
            <button
              onClick={handleStop}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-extrabold text-sm transition"
            >Stop</button>
          </>
        )}
      </div>
      <SessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveSession}
        defaultCategory={'productive'}
      />
    </div>
  );
}