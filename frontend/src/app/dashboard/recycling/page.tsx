'use client';

import { useState } from 'react';
import { 
  Recycle, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Leaf, 
  Zap,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { cn } from '@/lib/utils';
import { StatCard, SectionHeader } from '@/components/ui/Cards';
import { DynamicChart } from '@/components/ui/DynamicChart';
import { useUIStore } from '@/store/uiStore';
import { toast } from 'sonner';

const DIVERSION_DATA = [
  { name: 'Paper/Cardboard', value: 35, color: '#10b981' },
  { name: 'Plastics', value: 25, color: '#0d9488' },
  { name: 'Glass', value: 15, color: '#0f766e' },
  { name: 'Organic', value: 20, color: '#34d399' },
  { name: 'Others', value: 5, color: '#6ee7b7' },
];

const IMPACT_DATA = [
  { month: 'Jan', diverted: 120, baseline: 100 },
  { month: 'Feb', diverted: 140, baseline: 105 },
  { month: 'Mar', diverted: 180, baseline: 110 },
  { month: 'Apr', diverted: 210, baseline: 115 },
];

export default function RecyclingPlannerPage() {
  const { openReport } = useUIStore();


  return (
    <div className="space-y-6 lg:space-y-8 font-outfit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground mb-1 flex items-center gap-3">
            <Recycle className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" /> Recycling Planner
          </h1>
          <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest pl-11">
            Optimize material recovery and minimize landfill footprint with AI-driven diversion strategies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
            Simulate Strategy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Current Diversion Rate"
          value="42.5"
          unit="%"
          change={{ value: '1.2%', positive: true }}
          icon={TrendingUp}
          iconColor="text-emerald-500"
          onClick={() => openReport('stat', { label: 'Diversion Rate', value: '42.5', unit: '%', change: { value: '1.2%', positive: true } })}
        />
        <StatCard 
          label="Recovery Goal"
          value="55.0"
          unit="%"
          change={{ value: 'Target: Q4', positive: true }}
          icon={BarChart3}
          iconColor="text-teal-500"
          onClick={() => openReport('stat', { label: 'Recovery Goal', value: '55.0', unit: '%', change: { value: 'Target: Q4', positive: true } })}
        />
        <StatCard 
          label="Emissions Prevented"
          value="1.2"
          unit="Eco Impact"
          change={{ value: 'Record Month', positive: true }}
          icon={Leaf}
          iconColor="text-emerald-400"
          onClick={() => openReport('stat', { label: 'Emissions Prevented', value: '1.2', unit: 'Eco Impact', change: { value: 'Record Month', positive: true } })}
        />
        <StatCard 
          label="Economic Recovery"
          value="12.4K"
          unit="$ Value"
          change={{ value: '15.2%', positive: true }}
          icon={Zap}
          iconColor="text-yellow-500"
          onClick={() => openReport('stat', { label: 'Economic Recovery', value: '12.4K', unit: '$ Value', change: { value: '15.2%', positive: true } })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Material Mix */}
        <div className="liquid-glass border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
          <SectionHeader title="Material Composition" subtitle="Current recovery stream breakdown" />
          <div className="h-[240px] w-full mt-6 relative z-10 group-hover:scale-105 transition-transform duration-700">
            <DynamicChart>
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DIVERSION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {DIVERSION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsla(var(--card), 0.9)', backdropFilter: 'blur(12px)', border: '1px solid hsla(var(--border), 0.5)', borderRadius: '1rem', color: 'hsl(var(--foreground))', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 900 }}
                  itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 700 }}
                />
              </PieChart>
            </ResponsiveContainer>
            </DynamicChart>
          </div>
          <div className="space-y-2 mt-6 relative z-10">
            {DIVERSION_DATA.map((item) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-card/40 border border-transparent hover:border-white/10 transition-colors cursor-pointer group/item shadow-sm hover:shadow-md"
                onClick={() => toast.info(`Deep-diving into ${item.name} recovery workflows.`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full group-hover/item:scale-125 transition-transform shadow-inner" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-black tracking-wide text-muted-foreground group-hover/item:text-foreground transition-colors uppercase">{item.name}</span>
                </div>
                <span className="text-xs font-black text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Impact */}
        <div className="lg:col-span-2 liquid-glass-panel border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none transition-transform group-hover:scale-110" />
          <SectionHeader title="Diversion Impact Trend" subtitle="Actual vs Baseline (Landfill destined)" />
          <div className="h-[280px] w-full mt-6 relative z-10 flex-1">
            <DynamicChart>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={IMPACT_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--foreground), 0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: 'hsla(var(--card), 0.9)', backdropFilter: 'blur(12px)', border: '1px solid hsla(var(--border), 0.5)', borderRadius: '1rem', color: 'hsl(var(--foreground))', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 900 }} itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 700 }} />
                <Bar dataKey="diverted" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="baseline" fill="hsla(var(--foreground), 0.1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            </DynamicChart>
          </div>
          <div 
            className="mt-8 p-5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex gap-4 transition-colors relative z-10 shadow-inner shadow-emerald-500/5 cursor-pointer"
          >
            <Info className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground leading-relaxed mt-0.5">
              Diversion rates have increased by <span className="text-emerald-500 font-black">18%</span> since the implementation of the new AI route optimization in Zone C. Click to view deep metrics.
            </p>
          </div>
        </div>
      </div>

      <div className="liquid-glass border-yellow-500/30 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden group hover:border-yellow-500/50 transition-colors shadow-2xl">
        <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 -translate-y-1/2 pointer-events-none group-hover:via-yellow-500/10 transition-colors" />
        <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <h3 className="text-xl font-black text-foreground tracking-tight flex-col md:flex-row flex items-center gap-3"> 
              <div className="w-12 h-12 rounded-[1rem] bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-inner shadow-yellow-500/20 group-hover:scale-110 group-hover:rotate-12 transition-all">
                <Zap className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
              </div>
              AI Diversion Strategy Recommended
            </h3>
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground leading-relaxed pl-0 md:pl-16">
              Based on waste stream analysis in the Residential North district, increasing the collection frequency of "Organics" by <span className="text-foreground">20%</span> would potentially divert an additional <span className="text-foreground">1.4 tons</span> of waste per month with minimal operational cost increase.
            </p>
          </div>
          <button 
            onClick={() => toast.success('AI recommendation approved. Collection schedules adjusted automatically.')}
            className="flex-shrink-0 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
          >
            Apply Recommendation
          </button>
        </div>
      </div>
    </div>
  );
}
