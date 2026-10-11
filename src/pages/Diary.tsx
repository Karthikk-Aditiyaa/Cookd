import { useEffect, useState } from 'react';
import { db, initDB } from '../lib/db';
import type { Session } from '../lib/types';
import { format, subDays, addDays, startOfDay, isSameDay, parseISO } from 'date-fns';
import type { Category } from '../lib/types';

export default function Diary() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCat, setEditCat] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addTask, setAddTask] = useState('');
  const [addCat, setAddCat] = useState<Category>('productive');
  const [addStart, setAddStart] = useState<string>(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [addDurationMin, setAddDurationMin] = useState<number | ''>('');

  useEffect(() => { initDB(); load(); }, [selectedDate]);
  async function load() {
    const all = await db.sessions.toArray();
    const date = parseISO(selectedDate);
    const filtered = all.filter(s => isSameDay(s.startedAt, date));
    filtered.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
    setSessions(filtered);
  }

  const saveEdit = async (id: string) => {
    await db.sessions.update(id, { taskName: editName, category: editCat as any, taskKey: editName.toLowerCase().trim().replace(/[^a-z0-9\s]/g,'').substring(0,60) });
    setEditId(null); load();
  };
  const remove = async (id: string) => { if (confirm('Delete session?')) { await db.sessions.delete(id); await db.ledger.where({ sessionId: id }).delete(); load(); } };

  const saveAdd = async () => {
    if (!addTask.trim() || !addDurationMin) return;
    const start = new Date(addStart);
    const durationSec = +addDurationMin * 60;
    const end = new Date(start.getTime() + durationSec * 1000);
    await db.sessions.add({
      id: crypto.randomUUID(),
      taskName: addTask.trim(),
      taskKey: addTask.trim().toLowerCase().replace(/[^a-z0-9\s]/g,'').substring(0,60),
      startedAt: start,
      endedAt: end,
      durationSec,
      category: addCat,
      source: 'manual',
    });
    setAddModalOpen(false);
    setAddTask(''); setAddDurationMin(''); setAddStart(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    load();
  };

  const prevDay = () => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  const nextDay = () => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  const today = () => setSelectedDate(format(new Date(), 'yyyy-MM-dd'));

  // Timeline blocks for selected day
  const dayStart = new Date(parseISO(selectedDate));
  const slots = Array.from({ length: 24 }, (_, h) => h);

  // Aggregate per normalized task
  const taskTotals: Record<string, { sec: number; count: number; cat: string }> = {};
  for (const s of sessions) {
    const k = s.taskKey;
    if (!taskTotals[k]) taskTotals[k] = { sec: 0, count: 0, cat: s.category };
    taskTotals[k].sec += s.durationSec;
    taskTotals[k].count += 1;
  }

  const totalSec = sessions.reduce((a,b) => a + b.durationSec, 0);

  return (
    <div className="space-y-6">
      <h2 className="logo text-3xl font-normal italic text-[#f5c97a] tracking-tight">Diary</h2>

      {/* Calendar control */}
      <div className="flex items-center gap-3 bg-[#0f1115] border border-white/[0.06] rounded-[20px] px-5 py-3 shadow-none">
        <button onClick={prevDay} className="text-slate-500 hover:text-white px-2 text-lg">‹</button>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="bg-transparent text-white font-medium text-sm border-none outline-none font-mono"
        />
        <button onClick={nextDay} className="text-slate-500 hover:text-white px-2 text-lg">›</button>
        <button onClick={today} className="text-xs bg-[#1a1a1a] hover:bg-[#252525] text-[#f5c97a] px-3 py-1 rounded-full border border-white/[0.06] ml-auto">Today</button>
        <button onClick={() => setAddModalOpen(true)} className="text-xs bg-amber-500 text-slate-950 px-3 py-1 rounded-full font-bold ml-2">+ Add Session</button>
      </div>

      {/* Timeline / schedule */}
      <div className="bg-[#0f1115] border border-white/[0.06] rounded-[24px] p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Daily Timeline</h3>
        <div className="space-y-2">
          {slots.map(h => {
            const hourStart = new Date(dayStart); hourStart.setHours(h, 0, 0, 0);
            const hourEnd = new Date(dayStart); hourEnd.setHours(h + 1, 0, 0, 0);
            const inSlot = sessions.filter(s => {
              const sStart = s.startedAt.getTime();
              return sStart >= hourStart.getTime() && sStart < hourEnd.getTime();
            });
            return (
              <div key={h} className="flex gap-4 items-center group">
                <div className="w-14 text-xs text-slate-500 font-mono text-right shrink-0">{h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}</div>
                <div className={`flex-1 h-10 rounded-lg border border-white/[0.04] flex items-center px-3 gap-2 transition ${inSlot.length ? 'bg-white/[0.04]' : 'bg-transparent hover:bg-white/[0.02]'}`}>
                  {inSlot.length ? (
                    inSlot.map(s => (
                      <span key={s.id} className={`text-xs font-medium px-2.5 py-1 rounded-md truncate max-w-xs ${s.category === 'productive' ? 'bg-[#7ee787]/15 text-[#7ee787]' : s.category === 'unproductive' ? 'bg-[#f6a0a0]/15 text-[#f6a0a0]' : 'bg-amber-300/15 text-amber-300'}`}>
                        {s.taskName}
                      </span>
                    ))
                  ) : <span className="text-xs text-slate-600 italic">No session</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session details */}
      <div className="bg-[#0f1115] border border-white/[0.06] rounded-[24px] divide-y divide-white/[0.06]">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-slate-600 text-sm">No sessions on this day.</div>
        ) : (
          sessions.map(s => (
            <div key={s.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition">
              <div className="flex-1">
                {editId === s.id ? (
                  <div className="flex gap-2 items-center">
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="bg-[#0b0c10] border border-white/[0.08] rounded-lg px-2 py-1 text-sm text-white" />
                    <select value={editCat} onChange={e => setEditCat(e.target.value)} className="bg-[#0b0c10] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white"><option>productive</option><option>unproductive</option><option>uncertain</option></select>
                    <button onClick={() => saveEdit(s.id)} className="text-xs bg-[#f5c97a] text-[#0b0c10] px-2 py-1 rounded-lg font-bold">Save</button>
                  </div>
                ) : (
                  <>
                    <h4 className="font-bold text-white">{s.taskName}</h4>
                    <p className="text-xs text-slate-500">{new Date(s.startedAt).toLocaleTimeString()} · {Math.round(s.durationSec / 60)}m · <span className={`font-bold ${s.category === 'productive' ? 'text-[#7ee787]' : s.category === 'unproductive' ? 'text-[#f6a0a0]' : 'text-amber-300'}`}>{s.category}</span></p>
                  </>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => { setEditId(s.id); setEditName(s.taskName); setEditCat(s.category); }} className="text-xs bg-[#1a1a1a] text-slate-300 border border-white/[0.06] px-2 py-1 rounded-lg hover:text-white">Edit</button>
                <button onClick={() => remove(s.id)} className="text-xs bg-rose-900/30 text-rose-300 border border-rose-500/20 px-2 py-1 rounded-lg hover:bg-rose-900/60">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Per-task totals */}
      {Object.keys(taskTotals).length > 0 && (
        <div className="bg-[#0f1115] border border-white/[0.06] rounded-[20px] p-5">
          <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Task totals — {format(parseISO(selectedDate), 'MMMM d, yyyy')}</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(taskTotals).map(([key, v]) => (
              <div key={key} className="bg-[#0b0c10] border border-white/[0.06] rounded-xl px-4 py-3 min-w-[120px]">
                <div className="text-xs text-slate-500 truncate">{key}</div>
                <div className="text-lg font-extrabold text-[#f5c97a]">{Math.round(v.sec / 60)}m</div>
                <div className="text-[10px] text-slate-600">{v.count} session{v.count > 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-between text-xs text-slate-400 font-mono">
            <span>Total time: <b className="text-white">{Math.round(totalSec / 60)}m</b></span>
            <span>Sessions: <b className="text-white">{sessions.length}</b></span>
          </div>
        </div>
      )}
      {addModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAddModalOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-[#0f1115] border border-white/[0.06] rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Add Past Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Task Name</label>
                <input value={addTask} onChange={e => setAddTask(e.target.value)} className="w-full bg-[#0b0c10] border border-white/[0.08] rounded-lg px-3 py-2 text-white" placeholder="e.g., Woke up, showered..." />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <select value={addCat} onChange={e => setAddCat(e.target.value as Category)} className="w-full bg-[#0b0c10] border border-white/[0.08] rounded-lg px-3 py-2 text-white">
                  <option value="productive">Productive</option>
                  <option value="unproductive">Unproductive</option>
                  <option value="sleep">Sleep</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Time</label>
                  <input type="datetime-local" value={addStart} onChange={e => setAddStart(e.target.value)} className="w-full bg-[#0b0c10] border border-white/[0.08] rounded-lg px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Duration (minutes)</label>
                  <input type="number" min="1" value={addDurationMin} onChange={e => setAddDurationMin(Number(e.target.value) || '')} className="w-full bg-[#0b0c10] border border-white/[0.08] rounded-lg px-3 py-2 text-white" placeholder="e.g., 480" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddModalOpen(false)} className="flex-1 py-2 bg-slate-800 rounded-lg font-bold text-sm hover:bg-slate-700">Cancel</button>
              <button onClick={saveAdd} className="flex-1 py-2 bg-amber-500 text-slate-950 rounded-lg font-extrabold text-sm hover:bg-amber-400">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
