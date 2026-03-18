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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-500 dark:text-emerald-400" /> Waste Forecast
          </h1>
          <p className="text-muted-foreground text-sm">
            Predictive time-series modeling for urban waste generation peaks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3">
            <Calendar className="w-3.5 h-3.5" /> Next 7 Days
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-muted-foreground">
            Export Model <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid for Forecast insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div 
          className="lg:col-span-2 bg-card/50 border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 z-10 transition-transform group-hover:scale-110">
            <Maximize2 className="w-4 h-4 text-muted-foreground opacity-50" />
          </div>

          <SectionHeader title="Generation Projection" subtitle="Weekly waste output forecast across all sectors" />

          <div className="h-[320px] w-full mt-8 scale-100 group-hover:scale-[1.01] transition-transform duration-700">
            <DynamicChart>
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FORECAST_DATA}>
                <defs>
                  <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredict" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} 
                  unit=" T"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'hsl(var(--foreground))',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border">
            <div>
              <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mb-1">Max Capacity Event</p>
              <p className="text-sm font-semibold text-foreground">Sunday, 04:00 PM</p>
            </div>
            <div className="border-l border-border pl-4">
              <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mb-1">Confidence Interval</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">92.4% Accurate</p>
            </div>
            <div className="border-l border-border pl-4">
              <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mb-1">Trend Direction</p>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">+5.2% Upwards</p>
            </div>
            <div className="border-l border-border pl-4">
              <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mb-1">Anomalies Detected</p>
              <p className="text-sm font-semibold text-foreground">0 None</p>
            </div>
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          <div className="bg-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6" onClick={() => openReport('alert', { type: 'Critical Peaks', severity: 'HIGH', message: 'Upcoming overflow triggers in Central Market and Industrial Port.', time: 'Next 24-48h' })}>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center cursor-pointer hover:bg-orange-500/20 transition-colors">
                <Trash2 className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </div>
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <h3 className="text-sm font-semibold text-foreground">Critical Peaks</h3>
                <p className="text-[11px] text-muted-foreground">Upcoming overflow triggers</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">24h</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">Central Market Zone</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">+14% generation spike expected due to weekend commerce events.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">48h</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">Industrial Port District</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Heavy load forecast in RECYCLING sector (plastic diversion).</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-2 bg-foreground/5 hover:bg-muted border border-border rounded-xl text-[11px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-all">
              View historical logs
            </button>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col items-center text-center">
            <Zap className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-sm font-bold text-foreground mb-2">Policy Recommender</h3>
            <p className="text-[11px] text-primary/70 leading-relaxed mb-6">
              "Based on forecast, implement 'Zone C Peak Fee' to reduce industrial waste by 4%, saving 120kg of carbon tomorrow."
            </p>
            <button 
              onClick={() => {}}
              className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20"
            >
              Run Policy Simulation
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
