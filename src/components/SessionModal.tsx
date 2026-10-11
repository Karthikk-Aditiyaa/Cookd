import { useState } from 'react';
export default function SessionModal({ open, onClose, onSave, defaultCategory }: { open: boolean; onClose: () => void; onSave: (task: string, cat: string) => void; defaultCategory: string }) {
  const [text, setText] = useState('');
  const [cat, setCat] = useState(defaultCategory);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
        <h3 className="text-2xl font-extrabold text-white mb-2">Session complete</h3>
        <p className="text-slate-400 mb-6">What did you do?</p>
        <textarea value={text} onChange={e => setText(e.target.value)} className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white resize-none mb-4 focus:outline-none focus:border-amber-400" placeholder="e.g. read chapter 4, review PRs..." />
        <div className="flex gap-3 mb-6">
          <button onClick={() => setCat('productive')} className={`flex-1 py-2 rounded-lg font-bold text-sm border ${cat==='productive' ? 'bg-emerald-500 text-slate-950 border-emerald-500' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>Productive</button>
          <button onClick={() => setCat('unproductive')} className={`flex-1 py-2 rounded-lg font-bold text-sm border ${cat==='unproductive' ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>Unproductive</button>
          <button onClick={() => setCat('sleep')} className={`flex-1 py-2 rounded-lg font-bold text-sm border ${cat==='sleep' ? 'bg-purple-500 text-white border-purple-500' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>Sleep</button>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-800 rounded-xl font-bold text-sm hover:bg-slate-700 transition">Cancel</button>
          <button onClick={() => { if (!text.trim()) return; onSave(text.trim(), cat); }} className="flex-1 py-3 bg-amber-500 text-slate-950 rounded-xl font-extrabold text-sm hover:bg-amber-400 transition">Save Session</button>
        </div>
      </div>
    </div>
  );
}
