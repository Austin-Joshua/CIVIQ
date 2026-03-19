'use client';

import { ShieldCheck, Activity, AlertCircle, Leaf, CalendarClock, Target, BarChart } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Cards';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ExportButton } from '@/components/reports/ExportButton';
import { useIsMounted } from '@/hooks/useIsMounted';

const METRICS = [
  { label: 'CO2 Diversion Rate', value: '42.8%', target: '45.0%', status: 'warning' },
  { label: 'Recycling Contamination', value: '12.1%', target: '<15.0%', status: 'good' },
  { label: 'Fleet Emission Offset', value: '890 kg', target: '1000 kg', status: 'good' },
  { label: 'Hazardous Waste Compliance', value: '99.9%', target: '100%', status: 'critical' },
];

export default function CompliancePage() {
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-foreground">Compliance & Sustainability</h1>
          <p className="text-muted-foreground font-medium mt-1">
            National Environmental Regulatory Adherence Overview
          </p>
        </div>
        <ExportButton data={METRICS} filename="civiq_compliance_report" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card/50 border border-border rounded-[2rem] p-6 lg:p-8 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none transition-opacity group-hover:opacity-75" />
            <SectionHeader 
              title="State Regulatory Targets" 
              subtitle="Q1 2026 Environmental Performance"
              icon={ShieldCheck}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 relative z-10">
              {METRICS.map((metric, i) => (
                <div key={i} className="p-4 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all flex justify-between items-center group">
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">{metric.label}</h4>
                    <div className="flex items-end gap-2 mt-2">
                       <span className="text-2xl font-black text-foreground">{metric.value}</span>
                       <span className="text-[10px] font-medium text-muted-foreground pb-1">Target: {metric.target}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-3 h-3 rounded-full shadow-inner border",
                    metric.status === 'good' ? "bg-emerald-500 border-emerald-400 shadow-emerald-500/50" :
                    metric.status === 'warning' ? "bg-amber-500 border-amber-400 shadow-amber-500/50" :
                    "bg-red-500 border-red-400 shadow-red-500/50 animate-pulse"
                  )} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card/50 border border-border rounded-[2rem] p-6 lg:p-8">
            <SectionHeader 
              title="Official Protocol Generation" 
              subtitle="Certified Exports for Government Procurement"
              icon={Activity}
            />
            <div className="space-y-3 mt-6">
               {[
                 { t: 'EPA Monthly Waste Output Ledger', d: 'Comprehensive per-zone mass output for environmental protection agency.', i: Leaf },
                 { t: 'Fleet Operational Hours Log', d: 'Verifiable working hours and route distances per union guidelines.', i: Activity },
                 { t: 'Incident & Spill Resolution Record', d: 'Documented hazmat responses and timestamped resolution metrics.', i: AlertCircle }
               ].map((doc, idx) => (
                 <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-background border border-border hover:bg-muted/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                        <doc.i className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{doc.t}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{doc.d}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted rounded-lg shrink-0">
                      Standardized Form
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Audit Trail Sidebar */}
        <div className="space-y-6">
           <div className="bg-card/50 border border-border rounded-[2rem] p-6">
              <SectionHeader 
                title="Recent Audits" 
                subtitle="System-level access verification"
                icon={CalendarClock}
              />
              <div className="mt-6 space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                 {[
                   { action: 'State Admin Role Assigned', by: 'Super_Admin_01', time: '10:42 AM' },
                   { action: 'Route Policy Overridden', by: 'OpsCenter_Central', time: 'Yesterday' },
                   { action: 'Q4 Master Export Downloaded', by: 'Municipal_Auditor_F', time: '2 Days Ago' },
                   { action: 'Hazmat Protocol Altered', by: 'Gov_Admin_HQ', time: '2 Days Ago' },
                 ].map((log, idx) => (
                   <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-background bg-border text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                       <div className="w-1 h-1 rounded-full bg-primary" />
                     </div>
                     <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] border border-border bg-background p-3 rounded-xl shadow-sm">
                       <h5 className="text-[11px] font-bold text-foreground mb-0.5 truncate">{log.action}</h5>
                       <div className="flex items-center justify-between">
                         <span className="text-[9px] text-muted-foreground/80 font-medium">By: {log.by}</span>
                         <span className="text-[9px] font-black text-muted-foreground tracking-widest">{log.time}</span>
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
