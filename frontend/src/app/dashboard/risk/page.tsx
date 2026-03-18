'use client';

import { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Zap, 
  Clock, 
  MapPin, 
  Filter, 
  ChevronRight,
  Info,
  CheckCircle2,
  XCircle,
  BellRing
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { cn } from '@/lib/utils';
import { SectionHeader, StatCard, AlertCard } from '@/components/ui/Cards';
import { DynamicChart } from '@/components/ui/DynamicChart';

const RISK_RADAR_DATA = [
  { subject: 'Overflow', A: 80, fullMark: 100 },
  { subject: 'Traffic', A: 45, fullMark: 100 },
  { subject: 'Emissions', A: 30, fullMark: 100 },
  { subject: 'Staffing', A: 55, fullMark: 100 },
  { subject: 'Sensors', A: 90, fullMark: 100 },
  { subject: 'Logistics', A: 40, fullMark: 100 },
];

const RECENT_RISKS = [
  { id: 'RSK-102', zone: 'Zone C', type: 'Sanitation Delay', risk: 84, status: 'Active' },
  { id: 'RSK-105', zone: 'Zone A', type: 'Sensor Network Failure', risk: 92, status: 'Mitigating' },
  { id: 'RSK-108', zone: 'Zone D', type: 'Abnormal Generation', risk: 45, status: 'Monitoring' },
];

export default function RiskMonitorPage() {


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500 dark:text-red-400" /> Risk Monitor
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time anomaly detection and predictive infrastructure risk assessment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-all">
            <Filter className="w-3.5 h-3.5" /> Filter Assets
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-red-900/30">
            Establish Response
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Radar */}
        <div className="bg-card/50 border border-border rounded-2xl p-6">
          <SectionHeader title="City Risk Profile" subtitle="Multidimensional threat vector analysis" />
          <div className="h-[280px] w-full mt-4">
            <DynamicChart>
              <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RISK_RADAR_DATA}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Radar name="Risk Level" dataKey="A" stroke="#f87171" fill="#f87171" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
              </RadarChart>
            </ResponsiveContainer>
            </DynamicChart>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
              <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-widest">Global Risk</p>
              <p className="text-lg font-bold text-foreground tracking-tight">64.2%</p>
            </div>
            <div className="p-3 bg-card border border-border rounded-xl">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Stability</p>
              <p className="text-lg font-bold text-foreground tracking-tight">Medium</p>
            </div>
          </div>
        </div>

        {/* Active Anomalies List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card/50 border border-border rounded-2xl p-6 shadow-xl">
            <SectionHeader title="Anomalous Events Feed" subtitle="AI detection of irregular sensor patterns" />
            <div className="space-y-3 mt-6">
              {RECENT_RISKS.map((risk) => (
                <div 
                  key={risk.id} 
                  onClick={() => {}}
                  className="p-4 bg-card border border-border rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary/20 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border",
                      risk.risk > 80 ? "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400" : "bg-foreground/5 border-border text-muted-foreground"
                    )}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">{risk.id}</span>
                        <span className="text-sm font-semibold text-foreground">{risk.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> {risk.zone} • <Clock className="w-3 h-3" /> Detected 14m ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-widest mb-0.5">Risk Score</p>
                      <p className={cn("text-base font-bold", risk.risk > 80 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>{risk.risk}%</p>
                    </div>
                    <button className="p-2 bg-foreground/5 border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-border hover:bg-muted/50 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
              Initialize Fleet-wide Integrity Scan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card/50 border border-yellow-500/10 rounded-2xl p-6 relative overflow-hidden">
          <SectionHeader title="Health Metrics" subtitle="Sensor network integrity" />
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Active Nodes</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">99.2%</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="w-[99.2%] h-full bg-emerald-500" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-muted-foreground">Latency Delay</span>
              <span className="text-sm font-bold text-foreground">42ms</span>
            </div>
            <div className="flex justify-between items-center border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">Integrity Score</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span className="text-sm font-bold text-foreground">Secure</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center animate-pulse">
                <BellRing className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground uppercase tracking-tight">Preventative Protocol</h3>
                <p className="text-xs text-red-500/60 dark:text-red-200/40 font-medium uppercase tracking-widest mt-0.5">Automated Intelligence Recommendation</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Potential for <span className="text-foreground font-bold">Zone C overflow risk</span> has reached 84%. AI recommends enabling "Overflow Buffer B4" immediately to prevent street-level contamination leaks.
            </p>
          </div>
          <button 
            onClick={() => {}}
            className="flex-shrink-0 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/40"
          >
            Activate Buffer Protocol
          </button>
        </div>
      </div>

    </div>
  );
}
