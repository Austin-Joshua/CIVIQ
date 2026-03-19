'use client';

import { useState } from 'react';
import { 
  Layers, 
  Map as MapIcon, 
  AlertTriangle, 
  Trash2, 
  BarChart3, 
  Clock, 
  Database,
  Info,
  ChevronRight,
  Zap,
  Leaf
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  ResponsiveContainer, 
  Tooltip, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { cn } from '@/lib/utils';
import { StatCard, SectionHeader } from '@/components/ui/Cards';
import { DynamicChart } from '@/components/ui/DynamicChart';
import { useUIStore } from '@/store/uiStore';
import { toast } from 'sonner';

const FILL_LEVELS = [
  { name: 'Site Alpha', fill: 82, capacity: 50000 },
  { name: 'Site Beta', fill: 45, capacity: 35000 },
  { name: 'Site Gamma', fill: 94, capacity: 20000 },
  { name: 'Recovery Hub', fill: 12, capacity: 60000 },
];

const PROJECTION_DATA = [
  { year: '2024', usage: 12000 },
  { year: '2025', usage: 14500 },
  { year: '2026', usage: 18000 },
  { year: '2027', usage: 22000 },
  { year: '2028', usage: 24000 },
];

export default function LandfillIntelPage() {
  const { openReport } = useUIStore();


  return (
    <div className="space-y-6 lg:space-y-8 font-outfit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground mb-1 flex items-center gap-3">
            <Layers className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" /> Landfill Intelligence
          </h1>
          <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest pl-11">
            Capacity monitoring and lifecycle projections for urban waste facilities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-emerald-500/20">
            Capacity Forecast
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Residual Waste"
          value="18.2K"
          unit="Tons/yr"
          change={{ value: '4.2%', positive: false }}
          icon={Trash2}
          iconColor="text-white/40"
          onClick={() => openReport('stat', { label: 'Residual Waste', value: '18.2K', unit: 'Tons/yr', change: { value: '4.2%', positive: false } })}
        />
        <StatCard 
          label="Remaining Capacity"
          value="24.5"
          unit="%"
          change={{ value: 'Est. 2.4yrs', positive: false }}
          icon={Database}
          iconColor="text-orange-500"
          onClick={() => openReport('stat', { label: 'Remaining Capacity', value: '24.5', unit: '%', change: { value: 'Est. 2.4yrs', positive: false } })}
        />
        <StatCard 
          label="Daily Inflow"
          value="142"
          unit="Tons"
          change={{ value: 'Stable', positive: true }}
          icon={BarChart3}
          iconColor="text-teal-500"
          onClick={() => openReport('stat', { label: 'Daily Inflow', value: '142', unit: 'Tons', change: { value: 'Stable', positive: true } })}
        />
        <StatCard 
          label="Environmental Audit"
          value="98.2"
          unit="Compliance"
          change={{ value: 'Pass', positive: true }}
          icon={Leaf}
          iconColor="text-emerald-500"
          onClick={() => openReport('stat', { label: 'Environmental Audit', value: '98.2', unit: 'Compliance', change: { value: 'Pass', positive: true } })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Facility Fill Levels */}
        <div className="lg:col-span-2 liquid-glass-panel border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none transition-transform group-hover:scale-110" />
          <SectionHeader title="Active Site Monitoring" subtitle="Real-time fill capacity by facility" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 relative z-10 flex-1">
            {FILL_LEVELS.map((site) => (
              <div 
                key={site.name} 
                className="p-5 liquid-glass hover:bg-card/40 border-white/10 rounded-[1.5rem] group/card hover:border-emerald-500/30 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-foreground text-sm font-black tracking-tight">{site.name}</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.2em] leading-none mt-1.5">Total: {site.capacity.toLocaleString()} Tons</span>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded bg-background border text-[9px] font-black uppercase tracking-[0.2em] shadow-sm",
                    site.fill > 80 ? "border-red-500/20 text-red-500 shadow-red-500/10" : 
                    site.fill > 60 ? "border-orange-500/20 text-orange-500 shadow-orange-500/10" : "border-emerald-500/20 text-emerald-500 shadow-emerald-500/10"
                  )}>
                    {site.fill > 80 ? 'CRITICAL' : site.fill > 60 ? 'HIGH' : 'STABLE'}
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    <span>Capacity Usage</span>
                    <span className="text-foreground">{site.fill}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-background border border-border/50 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        site.fill > 80 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                        site.fill > 60 ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      )} 
                      style={{ width: `${site.fill}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capacity Projection Sidebar */}
        <div className="liquid-glass border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden flex flex-col group">
          <SectionHeader title="Capacity Lifecycle" subtitle="5-Year capacity projection" />
          <div className="h-[200px] w-full mt-6 relative z-10 group-hover:scale-105 transition-transform duration-700">
            <DynamicChart>
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PROJECTION_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--foreground), 0.05)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} dy={10} />
                <Tooltip contentStyle={{ backgroundColor: 'hsla(var(--card), 0.9)', backdropFilter: 'blur(12px)', border: '1px solid hsla(var(--border), 0.5)', borderRadius: '1rem', color: 'hsl(var(--foreground))', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 900 }} itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 700 }} />
                <Line type="monotone" dataKey="usage" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
            </DynamicChart>
          </div>
          <div className="mt-8 p-5 bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/20 rounded-2xl space-y-3 relative z-10 transition-colors shadow-inner shadow-orange-500/5 cursor-pointer group/alert">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover/alert:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Capacity Alert</span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground leading-relaxed">
              Based on current city growth of <span className="text-foreground font-black">2.4%</span>, Site Gamma will reach max capacity by June 2026. Diversion optimization in Zone C is critical.
            </p>
          </div>
        </div>
      </div>

      <div className="liquid-glass border-emerald-500/30 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-2xl">
        <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-y-1/2 pointer-events-none group-hover:via-emerald-500/10 transition-colors" />
        <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-12 transition-all">
              <Zap className="w-8 h-8 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-black text-foreground tracking-tight">Landfill Extension Strategy</h3>
              <p className="text-[10px] text-emerald-500 mt-1 uppercase tracking-[0.2em] font-black">AI Recommended Action</p>
            </div>
          </div>
          <button 
            onClick={() => toast.success('AI Strategy simulation initiated. ETA 2m to compile reports.')}
            className="flex items-center gap-3 px-6 py-3 liquid-glass hover:bg-emerald-500/10 border-white/10 hover:border-emerald-500/30 rounded-xl text-[10px] font-black text-foreground hover:text-emerald-500 uppercase tracking-[0.2em] transition-all group-hover:gap-4 shadow-sm"
          >
            Analyze Strategy <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
