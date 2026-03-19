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
import { useUIStore } from '@/store/uiStore';
import { toast } from 'sonner';

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
  const { openReport } = useUIStore();


  return (
    <div className="space-y-6 lg:space-y-8 font-outfit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground mb-1 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-red-500" /> Risk Monitor
          </h1>
          <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest pl-11">
            Real-time anomaly detection and predictive infrastructure risk assessment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 liquid-glass border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all shadow-sm">
            <Filter className="w-3.5 h-3.5" /> Filter Assets
          </button>
          <button 
            onClick={() => toast.success('Response sequence initiated. Notifying relevant city personnel.')}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
          >
            Establish Response
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Risk Radar */}
        <div className="liquid-glass border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
          <SectionHeader title="City Risk Profile" subtitle="Multidimensional threat vector analysis" />
          <div className="h-[280px] w-full mt-4 relative z-10 group-hover:scale-105 transition-transform duration-700">
            <DynamicChart>
              <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RISK_RADAR_DATA}>
                <PolarGrid stroke="hsla(var(--foreground), 0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                <Radar name="Risk Level" dataKey="A" stroke="#ef4444" strokeWidth={3} fill="#ef4444" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: 'hsla(var(--card), 0.9)', backdropFilter: 'blur(12px)', border: '1px solid hsla(var(--border), 0.5)', borderRadius: '1rem', color: 'hsl(var(--foreground))', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 900 }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
              </RadarChart>
            </ResponsiveContainer>
            </DynamicChart>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 relative z-10">
            <div className="p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl transition-colors shadow-inner shadow-red-500/10 cursor-pointer" onClick={() => toast.info('Detailed risk assessment compiling...')}>
              <p className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em]">Global Risk</p>
              <p className="text-xl font-black text-foreground tracking-tight mt-1">64.2%</p>
            </div>
            <div className="p-4 liquid-glass hover:bg-card/40 border-white/10 rounded-2xl transition-colors shadow-sm cursor-pointer" onClick={() => toast.info('System stability analyzing...')}>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">Stability</p>
              <p className="text-xl font-black text-foreground tracking-tight mt-1">Medium</p>
            </div>
          </div>
        </div>

        {/* Active Anomalies List */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8 flex flex-col">
          <div className="liquid-glass-panel border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group flex-1 flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none transition-transform group-hover:scale-110" />
            <SectionHeader title="Anomalous Events Feed" subtitle="AI detection of irregular sensor patterns" />
            <div className="space-y-3 mt-6 relative z-10 flex-1">
              {RECENT_RISKS.map((risk) => (
                <div 
                  key={risk.id} 
                  onClick={() => openReport('alert', { type: risk.type, severity: risk.risk > 80 ? 'CRITICAL' : 'HIGH', message: `Anomaly detected in ${risk.zone}. Risk score: ${risk.risk}%`, time: '14m ago' })}
                  className="p-4 lg:p-5 liquid-glass hover:bg-card/40 border border-transparent hover:border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between group/alert cursor-pointer shadow-sm hover:shadow-xl transition-all gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner group-hover/alert:scale-110 transition-transform",
                      risk.risk > 80 ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-red-500/20" : "bg-foreground/5 border-border/50 text-muted-foreground"
                    )}>
                      <Activity className="w-6 h-6 drop-shadow-sm" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{risk.id}</span>
                        <span className="text-base font-black text-foreground">{risk.type}</span>
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1.5 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> {risk.zone} <span className="text-border mx-1">|</span> <Clock className="w-3.5 h-3.5" /> 14m ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="text-right flex-1 sm:flex-none">
                      <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Risk Score</p>
                      <p className={cn("text-lg font-black", risk.risk > 80 ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]" : "text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]")}>{risk.risk}%</p>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center bg-foreground/5 border border-white/10 rounded-xl text-muted-foreground group-hover/alert:text-foreground group-hover/alert:bg-card/60 transition-all shadow-sm">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => toast.success('Fleet-wide integrity scan initiated. Compiling diagnostics...')}
              className="w-full mt-6 py-4 liquid-glass hover:bg-primary/5 hover:border-primary/30 border-white/10 rounded-xl text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-all relative z-10 shadow-sm"
            >
              Initialize Fleet-wide Integrity Scan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="liquid-glass border-emerald-500/20 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden border-t-emerald-500/40 shadow-2xl">
          <SectionHeader title="Health Metrics" subtitle="Sensor network integrity" />
          <div className="mt-6 space-y-6 relative z-10">
            <div className="group/stat cursor-pointer" onClick={() => toast.info('Detailed node analysis opening...')}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Nodes</span>
                <span className="text-sm font-black text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">99.2%</span>
              </div>
              <div className="w-full h-1.5 bg-background border border-border/50 rounded-full overflow-hidden p-0.5">
                <div className="w-[99.2%] h-full bg-emerald-500 rounded-full group-hover/stat:bg-emerald-400 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
            <div className="flex justify-between items-center group/stat cursor-pointer" onClick={() => toast.info('Pinging nearest towers...')}>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Latency Delay</span>
              <span className="text-sm font-black text-foreground group-hover/stat:text-emerald-500 transition-colors">42ms</span>
            </div>
            <div className="flex justify-between items-center border-t border-border/30 pt-6 group/stat cursor-pointer" onClick={() => toast.success('Network integrity verified.')}>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Integrity Score</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover/stat:scale-110 transition-transform" />
                <span className="text-sm font-black text-foreground group-hover/stat:text-emerald-500 transition-colors">Secure</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 liquid-glass border-red-500/30 rounded-[2rem] p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group hover:border-red-500/50 transition-colors border-t-red-500/50">
          <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 -translate-y-1/2 pointer-events-none group-hover:via-red-500/10 transition-colors" />
          
          <div className="space-y-4 relative z-10 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-inner shadow-red-500/20 group-hover:scale-110 transition-transform">
                <BellRing className="w-8 h-8 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Preventative Protocol</h3>
                <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] mt-1">Automated Intelligence Recommendation</p>
              </div>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-relaxed md:pl-20 max-w-xl">
              Potential for <span className="text-foreground font-black">Zone C overflow risk</span> has reached 84%. AI recommends enabling &quot;Overflow Buffer B4&quot; immediately to prevent street-level contamination leaks.
            </p>
          </div>
          <button 
            onClick={() => toast.success('Buffer Protocol B4 activated. Resources re-routed to Zone C.')}
            className="flex-shrink-0 px-8 py-4 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-red-500/20 active:scale-[0.98] relative z-10"
          >
            Activate Buffer Protocol
          </button>
        </div>
      </div>

    </div>
  );
}
