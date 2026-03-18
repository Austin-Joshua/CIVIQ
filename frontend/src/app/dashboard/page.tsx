'use client';

import { useState } from 'react';
import { 
  Map as MapIcon, 
  Route, 
  TrendingUp, 
  Leaf, 
  ChevronRight, 
  BarChart3,
  Trash2,
  AlertCircle,
  Zap,
  ArrowUpRight,
  MoreHorizontal,
  Filter,
  CheckCheck
} from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  Line,
  LineChart
} from 'recharts';
import { StatCard, AlertCard, SectionHeader } from '@/components/ui/Cards';
import { DynamicChart } from '@/components/ui/DynamicChart';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { useIsMounted } from '@/hooks/useIsMounted';

const MOCK_CHART_DATA = [
  { name: '06:00', waste: 400 },
  { name: '09:00', waste: 700 },
  { name: '12:00', waste: 900 },
  { name: '15:00', waste: 600 },
  { name: '18:00', waste: 500 },
  { name: '21:00', waste: 300 },
];

const MOCK_ZONE_DATA = [
  { name: 'Zone A - Central', score: 92, status: 'Clean' },
  { name: 'Zone B - Port Side', score: 68, status: 'Attention' },
  { name: 'Zone C - Industrial', score: 45, status: 'Risk' },
  { name: 'Zone D - Residential North', score: 85, status: 'Clean' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isMounted = useIsMounted();


  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground mb-1">
            Welcome, {isMounted ? (user?.name?.split(' ')[0] || 'Operator') : 'Operator'}
          </h1>
          <p className="text-muted-foreground font-medium">
            City status: <span className="text-emerald-500 font-bold">Stable</span>. Cleanliness score 82.4.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-all">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg transition-all shadow-lg shadow-primary/20">
            Generate Report
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Cleanliness"
          value="82.4"
          unit="/100"
          change={{ value: '2.1%', positive: true }}
          icon={BarChart3}
          iconColor="text-emerald-400"
          gradient="from-emerald-500/10 to-transparent"
          onClick={() => {}}
        />
        <StatCard 
          label="Waste Forecast"
          value="14.2"
          unit="Tons"
          change={{ value: '0.5%', positive: false }}
          icon={Trash2}
          iconColor="text-teal-400"
          gradient="from-teal-500/10 to-transparent"
          onClick={() => {}}
        />
        <StatCard 
          label="Alerts"
          value="12"
          change={{ value: '3 resolved', positive: true }}
          icon={AlertCircle}
          iconColor="text-orange-400"
          gradient="from-orange-500/10 to-transparent"
          onClick={() => {}}
        />
        <StatCard 
          label="Zones"
          value="4"
          change={{ value: 'All Active', positive: true }}
          icon={MapIcon}
          iconColor="text-emerald-300"
          gradient="from-emerald-300/10 to-transparent"
          onClick={() => {}}
        />
      </div>

      {/* Secondary Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Panel */}
        <div className="lg:col-span-2 bg-card/50 border border-border rounded-2xl p-6">
          <SectionHeader 
            title="Waste Generation" 
            subtitle="Current patterns across zones"
            action={
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            }
          />
          
          <div className="h-[280px] w-full mt-6">
            <DynamicChart>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--chart-axis))', fontSize: 11 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--chart-axis))', fontSize: 11 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(16,185,129,0.08)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'hsl(var(--foreground))',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="waste" radius={[4, 4, 0, 0]}>
                  {MOCK_CHART_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </DynamicChart>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-widest mb-1">Peak Time</p>
              <p className="text-foreground font-black text-sm">12:15 PM</p>
            </div>
            <div className="text-center border-l border-border">
              <p className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-widest mb-1">Total Daily</p>
              <p className="text-foreground font-black text-sm">3,402kg</p>
            </div>
          </div>
        </div>

        {/* Alerts & Risk Sidebar */}
        <div className="space-y-6">
          <div className="bg-card/50 border border-border rounded-2xl p-6">
            <SectionHeader 
              title="Alerts" 
              subtitle="Infrastructure updates"
            />
            <div className="space-y-3 mt-4">
              <AlertCard 
                type="Overflow Outbreak" 
                severity="CRITICAL" 
                message="Bin B12 in Zone C is at 98% capacity with blockage." 
                time="2 mins ago" 
              />
              <AlertCard 
                type="Service Gap" 
                severity="MEDIUM" 
                message="Vehicle V04 scheduled maintenance delayed." 
                time="14 mins ago" 
              />
              <AlertCard 
                type="Infrastructure Risk" 
                severity="HIGH" 
                message="Sensor network in Industrial Zone reporting high noise." 
                time="22 mins ago" 
              />
            </div>
            <button className="w-full mt-4 py-2 border border-border hover:bg-muted/50 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2">
              View All Alerts <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
              <Zap className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-sm font-black text-foreground mb-2">Optimization Tip</h3>
            <p className="text-primary/70 text-xs font-medium leading-relaxed mb-4">
              "Predicted overflows in Zone C can be mitigated by rerouting vehicle V09, saving 14% fuel."
            </p>
            <button className="text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:gap-2.5 transition-all">
              Apply <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Zone Cleanliness Ranking */}
      <div className="bg-card/50 border border-border rounded-2xl p-6">
        <SectionHeader 
          title="Zone Rankings" 
          subtitle="Top performing districts"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {MOCK_ZONE_DATA.map((zone) => (
            <div key={zone.name} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:bg-card/80">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold",
                zone.score >= 80 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" :
                zone.score >= 60 ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30" :
                "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30"
              )}>
                {zone.score}%
              </div>
              <div className="min-w-0">
                <p className="text-foreground/90 text-sm font-medium truncate">{zone.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 w-20 bg-muted rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full rounded-full",
                      zone.score >= 80 ? "bg-emerald-500" :
                      zone.score >= 60 ? "bg-yellow-500" :
                      "bg-red-500"
                    )} style={{ width: `${zone.score}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate uppercase">{zone.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
