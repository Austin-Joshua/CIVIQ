'use client';

import { useState } from 'react';
import { 
  Activity, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar, 
  Filter,
  Download,
  MoreHorizontal,
  ChevronRight,
  TrendingDown,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import { SectionHeader, StatCard } from '@/components/ui/Cards';
import { DynamicChart } from '@/components/ui/DynamicChart';
import { useUIStore } from '@/store/uiStore';

const MONTHLY_RECOVERY = [
  { month: 'Jan', value: 820 },
  { month: 'Feb', value: 950 },
  { month: 'Mar', value: 1100 },
  { month: 'Apr', value: 1050 },
  { month: 'May', value: 1300 },
  { month: 'Jun', value: 1450 },
];

const TABLE_DATA = [
  { zone: 'Zone A', generation: '82.4T', diversion: '42%', growth: '+2.1%', status: 'Clean' },
  { zone: 'Zone B', generation: '142.1T', diversion: '38%', growth: '+5.4%', status: 'Stable' },
  { zone: 'Zone C', generation: '210.5T', diversion: '28%', growth: '+12.5%', status: 'Risk' },
  { zone: 'Zone D', generation: '64.8T', diversion: '51%', growth: '-1.4%', status: 'Eco-Premium' },
];

export default function AnalyticsPage() {
  const { openReport } = useUIStore();


  return (
    <div className="space-y-6 lg:space-y-8 font-outfit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground mb-1 flex items-center gap-3">
            <Activity className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" /> Analytics
          </h1>
          <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest pl-11">
            Deep-dive urban sustainability data and comprehensive fleet performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 liquid-glass rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest border border-border/50">
            <Calendar className="w-3.5 h-3.5" /> Date Range
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-emerald-500/20">
            <Download className="w-3.5 h-3.5" /> Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Waste Processed" value="482.4" unit="Tons" icon={BarChart3} onClick={() => openReport('stat', { label: 'Total Waste Processed', value: '482.4', unit: 'Tons' })} />
        <StatCard label="Yearly Growth" value="+14.2" unit="%" icon={TrendingUp} iconColor="text-red-400" onClick={() => openReport('stat', { label: 'Yearly Growth', value: '+14.2', unit: '%', change: { value: '14.2%', positive: true } })} />
        <StatCard label="Fleet Usage" value="94.2" unit="%" icon={Clock} iconColor="text-teal-400" onClick={() => openReport('stat', { label: 'Fleet Usage', value: '94.2', unit: '%' })} />
        <StatCard label="Anomalies Found" value="12" unit="Events" icon={Activity} iconColor="text-orange-400" onClick={() => openReport('stat', { label: 'Anomalies Found', value: '12', unit: 'Events' })} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Performance Chart */}
        <div className="liquid-glass-panel border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none transition-transform group-hover:scale-110" />
          <SectionHeader title="Recovery Performance" subtitle="Monthly material diversion in tons" />
          <div className="h-[300px] w-full mt-6 relative z-10 flex-1">
            <DynamicChart>
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_RECOVERY}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--foreground), 0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsla(var(--card), 0.9)', backdropFilter: 'blur(12px)', border: '1px solid hsla(var(--border), 0.5)', borderRadius: '1rem', color: 'hsl(var(--foreground))', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 900 }} itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 700 }} />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#analyticsGradient)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
            </DynamicChart>
          </div>
        </div>

        {/* Fleet Breakdown */}
        <div className="liquid-glass border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden flex flex-col">
          <SectionHeader title="Zone Performance" subtitle="Generation vs Diversion capability" />
          <div className="mt-6 overflow-x-auto relative z-10 flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-[10px] uppercase font-black text-muted-foreground tracking-widest">
                  <th className="pb-4 pt-1 pl-4">Zone Name</th>
                  <th className="pb-4 pt-1 text-center">Generation</th>
                  <th className="pb-4 pt-1 text-center hidden sm:table-cell">Diversion</th>
                  <th className="pb-4 pt-1 text-center hidden md:table-cell">Growth</th>
                  <th className="pb-4 pt-1 text-right pr-4">Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {TABLE_DATA.map((row) => (
                  <tr key={row.zone} className="group hover:bg-card/40 transition-colors">
                    <td className="py-4 pl-4 rounded-l-2xl">
                      <p className="text-sm font-black text-foreground">{row.zone}</p>
                      <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground mt-0.5">District Urban-I</p>
                    </td>
                    <td className="py-4 text-center text-xs text-foreground/80 font-bold">{row.generation}</td>
                    <td className="py-4 text-center hidden sm:table-cell">
                      <span className="text-sm font-black text-emerald-500">{row.diversion}</span>
                    </td>
                    <td className="py-4 text-center hidden md:table-cell">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest p-1.5 px-2.5 rounded-lg border", row.growth.includes('+') ? "text-red-500 bg-red-500/10 border-red-500/20 shadow-inner shadow-red-500/10" : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-inner shadow-emerald-500/10")}>
                        {row.growth}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-4 rounded-r-2xl">
                       <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg border inline-block",
                        row.status === 'Risk' ? "border-red-500/30 text-red-500 bg-red-500/10" : 
                        row.status === 'Eco-Premium' ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10" :
                        "border-border/50 text-muted-foreground bg-foreground/5"
                       )}>
                         {row.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="w-full mt-6 py-3 liquid-glass hover:bg-primary/5 hover:border-primary/30 border-white/10 rounded-xl text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 relative z-10 shadow-sm">
            View Expanded Analytics Report <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
