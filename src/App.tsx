import { useState } from 'react';
import Header from './components/Header';
import Stopwatch from './components/Stopwatch';
import CountdownTimer from './components/CountdownTimer';
import Timer from './pages/Timer';
import Dashboard from './pages/Dashboard';
import Diary from './pages/Diary';
import Rankings from './pages/Rankings';
import Settings from './pages/Settings';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const nav = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'diary', label: 'Diary' },
    { key: 'rankings', label: 'Rankings' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e8e8e8] selection:bg-amber-400/20">
      <Header />
      <nav className="max-w-5xl mx-auto px-4 pt-6 flex gap-2">
        {nav.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${page === n.key ? 'bg-[#1a1a1a] text-[#f5c97a] border border-amber-300/20 shadow-[0_0_20px_-5px_rgba(251,191,36,0.15)]' : 'text-slate-400 hover:text-amber-200 border border-transparent hover:border-white/5'}`}>
            {n.label}
          </button>
        ))}
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {page === 'dashboard' && <Dashboard />}
        {page === 'diary' && <Diary />}
        {page === 'rankings' && <Rankings />}
        {page === 'settings' && <Settings />}
      </main>
      <section className="max-w-5xl mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stopwatch />
        <Timer />
        <CountdownTimer />
      </section>
    </div>
  );
}
