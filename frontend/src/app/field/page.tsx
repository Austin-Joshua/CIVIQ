'use client';

import { Map as MapIcon, Navigation, CheckSquare, AlertCircle, Camera, MessageSquare, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import Link from 'next/link';

export default function FieldOpsPage() {
  const [activeTab, setActiveTab] = useState('route');

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary/30">
      {/* High-Contrast Mobile Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white/5 rounded-lg border border-white/10">
                <ChevronLeft className="w-5 h-5 text-emerald-400" />
            </Link>
            <div>
                <h1 className="text-sm font-black uppercase tracking-widest text-white leading-none">Field Ops</h1>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-1">Vehicle V09 • Active</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-black uppercase text-white/60">GPS Synchronized</span>
        </div>
      </header>

      <main className="pb-24">
        {/* Map Context (Mock UI) */}
        <div className="relative h-64 bg-slate-900 border-b border-white/5 overflow-hidden">
            <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-74.006,40.7128,12/800x600?access_token=pk.xxx')] bg-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Next Collection</span>
                    <span className="text-[10px] font-bold text-emerald-500">240m away</span>
                </div>
                <h2 className="text-lg font-black text-white pr-8">Bin #B-114 • North Port Harbor</h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[9px] font-black text-red-500 uppercase">98% Full</div>
                    <div className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-[9px] font-black text-emerald-500 uppercase">Recycling</div>
                </div>
            </div>
        </div>

        {/* Task List */}
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Route Objectives</h3>
                <span className="text-[10px] font-bold text-white/60 bg-white/5 px-2 py-1 rounded-lg">4 / 12 Nodes</span>
            </div>

            <div className="space-y-3">
                {[
                    { id: 'B-114', loc: 'North Port Harbor', status: 'pending', type: 'high' },
                    { id: 'B-115', loc: 'Industrial Entrance', status: 'pending', type: 'normal' },
                    { id: 'B-112', loc: 'West Bridge Gate', status: 'completed', type: 'normal' },
                ].map((task, i) => (
                    <div key={i} className={cn(
                        "p-4 rounded-[1.5rem] border transition-all flex items-center justify-between",
                        task.status === 'completed' ? "bg-emerald-500/5 border-emerald-500/20 opacity-60" : "bg-white/5 border-white/10 bg-gradient-to-br from-white/5 to-transparent"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border",
                                task.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-white/5 border-white/10 text-white/60"
                            )}>
                                {task.status === 'completed' ? <CheckSquare className="w-5 h-5" /> : <Navigation className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white">{task.id}</h4>
                                <p className="text-[10px] text-white/40 font-medium">{task.loc}</p>
                            </div>
                        </div>
                        {task.status !== 'completed' && (
                            <button 
                                onClick={() => toast.success(`Node ${task.id} collected. Inventory synchronized.`)}
                                className="px-4 py-2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20"
                            >
                                Collect
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </main>

      {/* Field Fixed Navigation Bar */}
      <nav className="fixed bottom-6 left-4 right-4 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-2 flex items-center justify-between shadow-2xl z-50">
        <button className="flex-1 flex flex-col items-center gap-1 p-2 rounded-2xl bg-emerald-500 text-slate-950 transition-all">
            <MapIcon className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Guide</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-1 p-2 rounded-2xl text-white/60 hover:text-white transition-all">
            <Camera className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Capture</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-1 p-2 rounded-2xl text-white/60 hover:text-white transition-all">
            <AlertCircle className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Report</span>
        </button>
        <button className="flex-1 flex flex-col items-center gap-1 p-2 rounded-2xl text-white/60 hover:text-white transition-all">
            <MessageSquare className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-widest">Ops</span>
        </button>
      </nav>
    </div>
  );
}
