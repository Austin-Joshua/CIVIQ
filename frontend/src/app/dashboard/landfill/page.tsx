'use client';

import { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1 flex items-center gap-3">
            <Layers className="w-6 h-6 text-emerald-500 dark:text-emerald-400" /> Landfill Intelligence
          </h1>
          <p className="text-muted-foreground text-sm">
            Capacity monitoring and lifecycle projections for urban waste facilities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg transition-all shadow-lg shadow-primary/20">
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
        />
        <StatCard 
          label="Remaining Capacity"
          value="24.5"
          unit="%"
          change={{ value: 'Est. 2.4yrs', positive: false }}
          icon={Database}
          iconColor="text-orange-400"
        />
        <StatCard 
          label="Daily Inflow"
          value="142"
          unit="Tons"
          change={{ value: 'Stable', positive: true }}
          icon={BarChart3}
          iconColor="text-teal-400"
        />
        <StatCard 
          label="Environmental Audit"
          value="98.2"
          unit="Compliance"
          change={{ value: 'Pass', positive: true }}
          icon={Leaf}
          iconColor="text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facility Fill Levels */}
        <div className="lg:col-span-2 bg-card/50 border border-border rounded-2xl p-6">
          <SectionHeader title="Active Site Monitoring" subtitle="Real-time fill capacity by facility" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {FILL_LEVELS.map((site) => (
              <div key={site.name} className="p-4 bg-card border border-border rounded-xl group hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-foreground text-sm font-semibold">{site.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mt-1">Total: {site.capacity.toLocaleString()} Tons</span>
                  </div>
                  <div className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                    site.fill > 80 ? "bg-red-500/20 text-red-600 dark:text-red-400" : 
                    site.fill > 60 ? "bg-orange-500/20 text-orange-600 dark:text-orange-400" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  )}>
                    {site.fill > 80 ? 'CRITICAL' : site.fill > 60 ? 'HIGH' : 'STABLE'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Current Utilization</span>
                    <span className="font-bold">{site.fill}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        site.fill > 80 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                        site.fill > 60 ? "bg-orange-500" : "bg-emerald-500"
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
        <div className="bg-card/50 border border-border rounded-2xl p-6">
          <SectionHeader title="Capacity Lifecycle" subtitle="5-Year utilization projection" />
          <div className="h-[200px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PROJECTION_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="usage" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500 dark:text-orange-400" />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Capacity Alert</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Based on current city growth of <span className="text-foreground/80 font-bold">2.4%</span>, Site Gamma will reach max capacity by June 2026. Diversion optimization in Zone C is critical.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary rotate-12" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Landfill Extension Strategy</h3>
              <p className="text-xs text-primary/60 mt-1 uppercase tracking-widest font-bold">AI Recommended Action</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-primary/30 hover:bg-primary/10 rounded-xl text-xs font-bold text-primary transition-all group-hover:gap-3">
            Analyze Strategy <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
