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


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground mb-1 flex items-center gap-3">
            <Recycle className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 dark:text-emerald-400" /> Recycling Diversion Planner
          </h1>
          <p className="text-muted-foreground text-sm">
            Optimize material recovery and minimize landfill footprint with AI-driven diversion strategies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg transition-all shadow-lg shadow-primary/20">
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
          iconColor="text-emerald-400"

        />
        <StatCard 
          label="Recovery Goal"
          value="55.0"
          unit="%"
          change={{ value: 'Target: Q4', positive: true }}
          icon={BarChart3}
          iconColor="text-teal-400"

        />
        <StatCard 
          label="Emissions Prevented"
          value="1.2"
          unit="Eco Impact"
          change={{ value: 'Record Month', positive: true }}
          icon={Leaf}
          iconColor="text-emerald-300"

        />
        <StatCard 
          label="Economic Recovery"
          value="12.4K"
          unit="$ Value"
          change={{ value: '15.2%', positive: true }}
          icon={Zap}
          iconColor="text-yellow-400"

        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Material Mix */}
        <div className="bg-card/50 border border-border rounded-2xl p-6">
          <SectionHeader title="Material Composition" subtitle="Current recovery stream breakdown" />
          <div className="h-[240px] w-full mt-6">
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
                >
                  {DIVERSION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
            </DynamicChart>
          </div>
          <div className="space-y-2 mt-4">
            {DIVERSION_DATA.map((item) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => {}}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full group-hover:scale-125 transition-transform" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Impact */}
        <div className="lg:col-span-2 bg-card/50 border border-border rounded-2xl p-6">
          <SectionHeader title="Diversion Impact Trend" subtitle="Actual vs Baseline (Landfill destined)" />
          <div className="h-[280px] w-full mt-6">
            <DynamicChart>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={IMPACT_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--chart-grid))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--chart-axis))', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--chart-axis))', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="diverted" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="baseline" fill="hsla(var(--foreground), 0.05)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            </DynamicChart>
          </div>
          <div 
            className="mt-6 p-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-xl flex gap-4 transition-colors"
          >
            <Info className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Diversion rates have increased by <span className="text-emerald-600 dark:text-emerald-400 font-bold">18%</span> since the implementation of the new AI route optimization in Zone C. Click to view deep metrics.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2"> 
              <Zap className="w-5 h-5 text-yellow-500 dark:text-yellow-400" /> AI Diversion Strategy Recommended
            </h3>
            <p className="text-sm text-primary/70 leading-relaxed">
              Based on waste stream analysis in the Residential North district, increasing the collection frequency of "Organics" by 20% would potentially divert an additional 1.4 tons of waste per month with minimal operational cost increase.
            </p>
          </div>
          <button 
            onClick={() => {}}
            className="flex-shrink-0 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            Apply Recommendation
          </button>
        </div>
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}
