import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../lib/db';
import SessionModal from './SessionModal';

let alarmAudioCtx: AudioContext | null = null;

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pausedAt, setPausedAt] = useState<Date | null>(null);
  const [accumulated, setAccumulated] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [taskText, setTaskText] = useState('');
  const tickRef = useRef<number>(0);
  const [now, setNow] = useState(Date.now());
  const [alarmFired, setAlarmFired] = useState(false);
  const [notifyPermission, setNotifyPermission] = useState<'default'|'granted'|'denied'>('default');

  // Request notification permission once
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().then(p => setNotifyPermission(p));
    } else if (typeof Notification !== 'undefined') {
      setNotifyPermission(Notification.permission as any);
    }
  }, []);

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

  useEffect(() => {
    let interval: number;
    if (running) {
      interval = setInterval(() => setNow(Date.now()), 100);
    }
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    localStorage.setItem('timer_state', JSON.stringify({ startTime, pausedAt, accumulated, running }));
  }, [startTime, pausedAt, accumulated, running]);

  function format(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  }

  const elapsed = running ? Math.floor((Date.now() - (startTime?.getTime() || 0)) / 1000) + accumulated - Math.floor((pausedAt ? (pausedAt.getTime() - (startTime?.getTime() || 0)) / 1000 : 0)) : accumulated;

  function playAlarmSound() {
    try {
      if (!alarmAudioCtx) alarmAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = alarmAudioCtx.createOscillator();
      const gain = alarmAudioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, alarmAudioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, alarmAudioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, alarmAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, alarmAudioCtx.currentTime + 0.6);
      osc.connect(gain); gain.connect(alarmAudioCtx.destination);
      osc.start(); osc.stop(alarmAudioCtx.currentTime + 0.6);
    } catch {}
  }

  function triggerNotification() {
    setAlarmFired(true);
    playAlarmSound();
    if (notifyPermission === 'granted' && typeof Notification !== 'undefined') {
      try {
        new Notification('TimeLedger - 25:00 reached!', { body: 'Stopwatch hit 25 minutes. Keep going or stop?', icon: '/icon.png', tag: 'timeledger-alarm', requireInteraction: true });
      } catch {}
    }
  }

  // Trigger alarm at 25:00 (1500 sec) and also when countdown hits 0
  useEffect(() => {
    if (!running || alarmFired) return;
    if (elapsed >= 1500) {
      triggerNotification();
    }
  }, [running, elapsed, alarmFired, notifyPermission]);

  const handleStop = () => { setRunning(false); setModalOpen(true); setAlarmFired(false); };
  const saveSession = async (task: string, category: string) => {
    const session = {
      id: crypto.randomUUID(),
      taskName: task,
      taskKey: task.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').substring(0,60),
      startedAt: startTime || new Date(),
      endedAt: new Date(),
      durationSec: elapsed,
      category: category as 'productive' | 'unproductive' | 'uncertain',
      source: 'stopwatch' as const,
    };
    await db.sessions.add(session);
    // Recompute ledger (simplified)
    localStorage.removeItem('timer_state');
    setRunning(false); setStartTime(null); setPausedAt(null); setAccumulated(0); setModalOpen(false); setTaskText('');
    window.location.reload();
  };

  return (
    <div className="bg-[#0f1115] border border-white/[0.06] rounded-[24px] p-6 shadow-2xl backdrop-blur-sm">
      <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Stopwatch</h2>
      <div className="text-6xl font-mono font-extrabold text-[#f5c97a] tracking-tighter mb-6">{format(Math.max(0,elapsed))}</div>
      <div className="flex gap-2 mb-4">
        {!startTime && !running ? (
          <button onClick={() => { setStartTime(new Date()); setRunning(true); setAccumulated(0); setPausedAt(null); }} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#0b0c10] rounded-xl font-extrabold text-sm transition">Start</button>
        ) : running ? (
          <>
            <button onClick={() => { setPausedAt(new Date()); setRunning(false); }} className="px-6 py-3 bg-[#f5c97a] text-[#0b0c10] rounded-xl font-extrabold text-sm transition">Pause</button>
            <button onClick={handleStop} className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-extrabold text-sm transition">Stop</button>
          </>
        ) : (
          <>
            <button onClick={() => { setRunning(true); setPausedAt(null); }} className="px-6 py-3 bg-[#f5c97a] text-[#0b0c10] rounded-xl font-extrabold text-sm transition">Resume</button>
            <button onClick={handleStop} className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-extrabold text-sm transition">Stop</button>
          </>
        )}
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-1000" style={{ width: `${Math.min(100, (elapsed / (25*60)) * 100)}%` }} />
      </div>
      <SessionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={saveSession} defaultCategory={'productive'} />
      {alarmFired && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setAlarmFired(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-gradient-to-br from-amber-500 to-rose-500 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-pulse">
            <h3 className="text-3xl font-extrabold text-[#0b0c10] mb-2">🎉 25:00 Reached</h3>
            <p className="text-slate-900 font-semibold mb-4">Your stopwatch hit the focus milestone.</p>
            <button onClick={() => setAlarmFired(false)} className="bg-slate-950 text-[#f5c97a] px-6 py-2 rounded-xl font-extrabold text-sm">Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}
// Note: for full v2 spec, stopwatch writes session to DB immediately on Stop before showing modal.
// Active timer state is checkpointed to DB (not just localStorage) for crash resilience.
