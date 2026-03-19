'use client';

import { Leaf, Recycle, Map, Globe, ShieldCheck, BarChart3, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PublicTransparencyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100">
      {/* Public Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100 p-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">C</div>
            <div className="flex flex-col">
                <span className="text-sm font-black tracking-tighter text-slate-900 leading-none">CIVIQ CITIZEN</span>
                <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-[0.2em] mt-1">Sustainability Portal</p>
            </div>
        </div>
        <Link href="/auth/login" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
            Official Access
        </Link>
      </header>

      <main>
        {/* Ecological Pride Hero */}
        <section className="py-20 px-6 max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                <Globe className="w-3.5 h-3.5" /> Environmental Accountability
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6">Building a <span className="text-emerald-500">Greener</span> City Together.</h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                CIVIQ enables unprecedented transparency in municipal waste operations, tracking every kilogram of waste and its journey to recovery.
            </p>
        </section>

        {/* Global Impact Dashboard */}
        <section className="px-6 max-w-7xl mx-auto mb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Diversion Rate', value: '42.8%', detail: 'Global city average: 31%', icon: Recycle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'CO2 Mitigated', value: '1,240T', detail: 'Equivalent to 3,400 trees', icon: Leaf, color: 'text-teal-500', bg: 'bg-teal-50' },
                    { label: 'Service Reliability', value: '99.4%', detail: 'Collection nodes reached', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
                ].map((stat, i) => (
                    <div key={i} className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative group overflow-hidden">
                        <div className={cn("absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110", stat.color)}>
                            <stat.icon className="w-24 h-24" />
                        </div>
                        <div className={cn("w-12 h-12 rounded-2xl mb-6 flex items-center justify-center", stat.bg, stat.color)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</h3>
                        <div className="flex items-baseline gap-2 mb-2">
                             <span className="text-4xl font-black text-slate-900">{stat.value}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500">{stat.detail}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Accountability Statement */}
        <section className="bg-slate-900 py-24 px-6 text-white text-center">
            <div className="max-w-2xl mx-auto">
                <BarChart3 className="w-12 h-12 text-emerald-500 mx-auto mb-8" />
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6">Real Data. Real Impact.</h2>
                <p className="text-white/60 mb-10 leading-relaxed font-medium">
                    Our performance metrics are verified against national environmental standards (EPA-S29) and are auditable by external regulatory bodies.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button className="px-8 py-3 bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-all flex items-center gap-2 group">
                        View Interactive Map <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="px-8 py-3 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                        Download Q1 Report
                    </button>
                </div>
            </div>
        </section>
      </main>

      <footer className="py-12 px-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">CIVIQ • URBAN INTEL OS</span>
          <div className="flex items-center gap-8">
              {['About', 'Privacy', 'Compliance', 'APIs'].map(link => (
                  <button key={link} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors">{link}</button>
              ))}
          </div>
      </footer>
    </div>
  );
}
