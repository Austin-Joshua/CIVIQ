'use client';

import { useState } from 'react';
import { Activity, Terminal, Shield, User, Globe, FileCode2, Clock, CheckCircle2, AlertTriangle, Key, Search, TriangleAlert, Truck, Trash2, CheckCircle, ShieldAlert } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Cards';
import { useToast } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';
import { downloadCsvFile } from '@/lib/download';

const TIMELINE_EVENTS = [
  { id: 'EVT-01', title: 'Route Optimization Triggered', type: 'system', time: '10:42 AM', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'EVT-02', title: 'Fleet V-09 Rerouted', type: 'action', time: '10:15 AM', icon: Truck, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  { id: 'EVT-03', title: 'Zone B Overload Alert', type: 'alert', time: '09:30 AM', icon: TriangleAlert, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'EVT-04', title: 'System DB Backup', type: 'system', time: '04:00 AM', icon: Database, color: 'text-blue-500', bg: 'bg-blue-500/10' },
];

const INCIDENTS = [
  { id: 'INC-102', title: 'Overflow at Transit Hub', status: 'In Progress', priority: 'High', assignee: 'Team Alpha', time: '2 hours ago', icon: Trash2 },
  { id: 'INC-103', title: 'Vehicle V-12 Maintenance', status: 'Pending', priority: 'Medium', assignee: 'Workshop', time: '5 hours ago', icon: Truck },
  { id: 'INC-104', title: 'Unauthorized API Access Attempt', status: 'Resolved', priority: 'Critical', assignee: 'SysAdmin', time: '1 day ago', icon: ShieldAlert },
];

function Database(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

export default function ActivityLogsPage() {
  const { toast } = useToast();

  const handleExport = () => {
    downloadCsvFile(
      [
        ['event_id', 'title', 'type', 'time'],
        ...TIMELINE_EVENTS.map((evt) => [evt.id, evt.title, evt.type, evt.time]),
      ],
      `operations-timeline-${Date.now()}.csv`
    );

    toast({
      title: 'Audit Export Complete',
      description: 'The secure CSV log has been downloaded.',
      type: 'success'
    });
  };

  return (
    <div className="space-y-6 lg:space-y-8 font-outfit">
      <SectionHeader title="Operations Intelligence" subtitle="Live incident management and chronological operational timeline." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Incident Management Workflow */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <TriangleAlert className="w-5 h-5 text-emerald-500" /> Active Incidents
            </h2>
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              + New Ticket
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="liquid-glass p-4 rounded-2xl border-white/5 border border-border/50">
               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Total Active</p>
               <p className="text-3xl font-black text-foreground">12</p>
            </div>
            <div className="liquid-glass p-4 rounded-2xl border-orange-500/20 shadow-lg shadow-orange-500/5">
               <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-1">High Priority</p>
               <p className="text-3xl font-black text-foreground">3</p>
            </div>
            <div className="liquid-glass p-4 rounded-2xl border-emerald-500/20 shadow-lg shadow-emerald-500/5">
               <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Resolved Today</p>
               <p className="text-3xl font-black text-foreground">28</p>
            </div>
          </div>

          <div className="space-y-4">
            {INCIDENTS.map((inc) => (
              <div key={inc.id} className="liquid-glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner",
                    inc.priority === 'Critical' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                    inc.priority === 'High' ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" :
                    "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  )}>
                    <inc.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{inc.id}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                        inc.status === 'Resolved' ? "bg-emerald-500/10 text-emerald-500" :
                        inc.status === 'In Progress' ? "bg-blue-500/10 text-blue-500" :
                        "bg-yellow-500/10 text-yellow-500"
                      )}>{inc.status}</span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{inc.title}</h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 sm:gap-8">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Assignee</p>
                    <p className="text-xs font-semibold text-foreground">{inc.assignee}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Updated</p>
                    <p className="text-xs font-semibold text-foreground">{inc.time}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Timeline */}
        <div className="xl:col-span-1 border border-border bg-card/40 backdrop-blur-3xl rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
           <div className="flex items-center justify-between mb-8 relative z-10">
             <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
               <Clock className="w-5 h-5 text-emerald-500" /> Timeline
             </h2>
             <button onClick={handleExport} className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all">
               <Globe className="w-4 h-4" />
             </button>
           </div>

           <div className="relative z-10 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
             {TIMELINE_EVENTS.map((evt, idx) => (
               <div key={evt.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8 last:mb-0">
                 
                 {/* Icon */}
                 <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border border-card bg-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2", evt.color, evt.bg)}>
                   <evt.icon className="w-4 h-4" />
                 </div>
                 
                 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-background/50 shadow-sm backdrop-blur-sm group-hover:border-emerald-500/30 transition-all">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{evt.id}</span>
                     <span className="text-[9px] font-bold text-muted-foreground">{evt.time}</span>
                   </div>
                   <p className="text-sm font-bold text-foreground leading-snug">{evt.title}</p>
                 </div>
               </div>
             ))}
           </div>
           
           <div className="mt-8 pt-6 border-t border-border flex justify-center relative z-10">
             <button className="text-xs font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">
               Load More Output...
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
