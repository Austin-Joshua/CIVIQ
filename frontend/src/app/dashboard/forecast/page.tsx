'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Leaf, 
  Trash2, 
  BarChart3, 
  Zap, 
  History,
  Calendar,
  ChevronDown,
  Info,
  Maximize2
} from 'lucide-react';
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { cn } from '@/lib/utils';
import { StatCard, SectionHeader } from '@/components/ui/Cards';
import { DynamicChart } from '@/components/ui/DynamicChart';
import { useUIStore } from '@/store/uiStore';
import { toast } from 'sonner';

const FORECAST_DATA = [
  { day: 'Mon', historical: 400, predicted: 420 },
  { day: 'Tue', historical: 450, predicted: 480 },
  { day: 'Wed', historical: 510, predicted: 505 },
  { day: 'Thu', historical: 480, predicted: 540 },
  { day: 'Fri', historical: 620, predicted: 680 },
  { day: 'Sat', historical: 750, predicted: 820 },
  { day: 'Sun', historical: 700, predicted: 760 },
];

export default function WasteForecastPage() {
  const { openReport } = useUIStore();


  return (
    <div className="space-y-6 lg:space-y-8 font-outfit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground mb-1 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" /> Waste Forecast
          </h1>
          <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest pl-11">
            Predictive time-series modeling for urban waste generation peaks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest px-4 py-2 liquid-glass border-white/10 rounded-xl">
            <Calendar className="w-3.5 h-3.5" /> Next 7 Days
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-emerald-500/20">
            Export Model <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid for Forecast insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Main Chart */}
        <div 
          className="lg:col-span-2 liquid-glass-panel border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group flex flex-col"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none transition-transform group-hover:scale-110" />
          <div className="absolute top-0 right-0 p-6 z-20 transition-transform group-hover:scale-110">
            <Maximize2 className="w-4 h-4 text-muted-foreground opacity-50 hover:bg-muted/50 rounded cursor-pointer" />
          </div>

          <SectionHeader title="Generation Projection" subtitle="Weekly waste output forecast across all sectors" />

          <div className="h-[320px] w-full mt-8 scale-100 group-hover:scale-[1.01] transition-transform duration-700 relative z-10 flex-1">
            <DynamicChart>
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FORECAST_DATA}>
                <defs>
                  <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredict" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--foreground), 0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} 
                  unit=" T"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsla(var(--card), 0.9)', 
                    backdropFilter: 'blur(12px)',
                    border: '1px solid hsla(var(--border), 0.5)',
                    borderRadius: '1rem',
                    fontSize: '12px',
                    color: 'hsl(var(--foreground))',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 900 }}
                  itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 700 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="historical" 
                  stroke="#10b981" 
                  strokeOpacity={0.4}
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorHistory)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#34d399" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPredict)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
            </DynamicChart>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/30 relative z-10">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Max Capacity Event</p>
              <p className="text-xs font-black text-foreground">Sunday, 04:00 PM</p>
            </div>
            <div className="border-l border-border/30 pl-4">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Confidence Interval</p>
              <p className="text-xs font-black text-emerald-500 shadow-emerald-500/20">92.4% Accurate</p>
            </div>
            <div className="border-l border-border/30 pl-4">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Trend Direction</p>
              <p className="text-xs font-black text-red-500 shadow-red-500/20">+5.2% Upwards</p>
            </div>
            <div className="border-l border-border/30 pl-4">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Anomalies Detected</p>
              <p className="text-xs font-black text-foreground">0 None</p>
            </div>
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6 lg:space-y-8">
          <div className="liquid-glass border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-6 relative z-10 cursor-pointer group" onClick={() => openReport('alert', { type: 'Critical Peaks', severity: 'HIGH', message: 'Upcoming overflow triggers in Central Market and Industrial Port.', time: 'Next 24-48h' })}>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shadow-orange-500/20">
                <Trash2 className="w-6 h-6 text-orange-500" />
              </div>
              <div className="group-hover:opacity-80 transition-opacity">
                <h3 className="text-lg font-black tracking-tight text-foreground">Critical Peaks</h3>
                <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground mt-0.5">Upcoming overflow triggers</p>
              </div>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/40 border border-border/50 hover:border-orange-500/30 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-white/10 flex items-center justify-center text-[10px] font-black tracking-widest text-muted-foreground shadow-sm group-hover:bg-orange-500/10 group-hover:text-orange-500 group-hover:border-orange-500/20 transition-all">24h</div>
                <div className="flex-1 mt-0.5">
                  <p className="text-sm font-black text-foreground">Central Market Zone</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/80 mt-1 leading-relaxed tracking-wider">+14% generation spike expected due to weekend commerce events.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card/40 border border-border/50 hover:border-orange-500/30 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-white/10 flex items-center justify-center text-[10px] font-black tracking-widest text-muted-foreground shadow-sm group-hover:bg-orange-500/10 group-hover:text-orange-500 group-hover:border-orange-500/20 transition-all">48h</div>
                <div className="flex-1 mt-0.5">
                  <p className="text-sm font-black text-foreground">Industrial Port District</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/80 mt-1 leading-relaxed tracking-wider">Heavy load forecast in RECYCLING sector (plastic diversion).</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => toast.info('Historical logs feature coming soon!')}
              className="w-full mt-6 py-3 liquid-glass hover:bg-orange-500/5 hover:border-orange-500/30 hover:text-orange-500 border-white/10 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] transition-all relative z-10 shadow-sm"
            >
              View historical logs
            </button>
          </div>

          <div className="liquid-glass border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />
            
            <Zap className="w-10 h-10 text-emerald-500 mb-4 relative z-10 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black tracking-tight text-foreground mb-2 relative z-10">Policy Recommender</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-loose mb-6 relative z-10">
              "Based on forecast, implement 'Zone C Peak Fee' to reduce industrial waste by <span className="text-emerald-500">4%</span>, saving <span className="text-emerald-500">120kg</span> of carbon tomorrow."
            </p>
            <button 
              onClick={() => toast.success('Policy simulation running. Computing economic and environmental impact...')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-emerald-500/20 relative z-10 hover:scale-[1.02] active:scale-[0.98]"
            >
              Run Policy Simulation
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
