'use client';

import { useState, useEffect } from 'react';
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
            <Activity className="w-6 h-6 text-emerald-500 dark:text-emerald-400" /> Analytics Mode
          </h1>
          <p className="text-muted-foreground text-sm">
            Deep-dive urban sustainability data and comprehensive fleet performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-all">
            <Calendar className="w-3.5 h-3.5" /> Date Range
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg transition-all shadow-lg shadow-primary/20">
            <Download className="w-3.5 h-3.5" /> Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Waste Processed" value="482.4" unit="Tons" icon={BarChart3} />
        <StatCard label="Yearly Growth" value="+14.2" unit="%" icon={TrendingUp} iconColor="text-red-400" />
        <StatCard label="Fleet Utilization" value="94.2" unit="%" icon={Clock} iconColor="text-teal-400" />
        <StatCard label="Anomalies Found" value="12" unit="Events" icon={Activity} iconColor="text-orange-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-card/50 border border-border rounded-2xl p-6">
          <SectionHeader title="Recovery Performance" subtitle="Monthly material diversion in tons" />
          <div className="h-[300px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_RECOVERY}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                <Area type="step" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#analyticsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Breakdown */}
        <div className="bg-card/50 border border-border rounded-2xl p-6 shadow-2xl">
          <SectionHeader title="Zone Efficiency Heatmap" subtitle="Generation vs Diversion capability" />
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">
                  <th className="pb-4 pt-1 font-bold">Zone Name</th>
                  <th className="pb-4 pt-1 font-bold text-center">Generation</th>
                  <th className="pb-4 pt-1 font-bold text-center">Diversion</th>
                  <th className="pb-4 pt-1 font-bold text-center">Growth</th>
                  <th className="pb-4 pt-1 font-bold text-right pr-2">Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TABLE_DATA.map((row) => (
                  <tr key={row.zone} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-4">
                      <p className="text-sm font-semibold text-foreground">{row.zone}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">District Urban-I</p>
                    </td>
                    <td className="py-4 text-center text-sm text-foreground/70 font-medium">{row.generation}</td>
                    <td className="py-4 text-center">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{row.diversion}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={cn("text-[11px] font-bold p-1 px-2 rounded-md", row.growth.includes('+') ? "text-red-600 dark:text-red-400 bg-red-400/5 border border-red-500/10" : "text-emerald-600 dark:text-emerald-400 bg-emerald-400/5 border border-emerald-500/10")}>
                        {row.growth}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-2">
                       <span className={cn(
                        "text-[9px] font-bold uppercase py-1 px-2 rounded border",
                        row.status === 'Risk' ? "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5" : 
                        row.status === 'Eco-Premium' ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5" :
                        "border-border text-muted-foreground bg-foreground/5"
                       )}>
                         {row.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="w-full mt-6 py-2.5 bg-foreground/5 border border-border hover:bg-muted rounded-xl text-xs font-bold text-muted-foreground transition-all flex items-center justify-center gap-2">
            View Expanded Analytics Report <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
