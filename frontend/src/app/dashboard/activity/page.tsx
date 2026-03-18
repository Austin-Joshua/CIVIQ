'use client';

import { useState } from 'react';
import { Activity, Terminal, Shield, User, Globe, FileCode2, Clock, CheckCircle2, AlertTriangle, Key, Search } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Cards';
import { useToast } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';

const LOGS = [
  { id: 'EVT-9901', type: 'system', action: 'Route Optimization Algorithm Triggered', subject: 'System AI', target: 'Fleet Sector B', status: 'success', time: '2 mins ago', icon: Activity },
  { id: 'EVT-9902', type: 'auth', action: 'Elevated Access Granted', subject: 'Admin User', target: 'Security Module', status: 'success', time: '14 mins ago', icon: Key },
  { id: 'EVT-9903', type: 'data', action: 'Telemetry Sync Failure', subject: 'Sensor Network', target: 'Zone D Hub', status: 'warning', time: '1 hour ago', icon: AlertTriangle },
  { id: 'EVT-9904', type: 'user', action: 'Manual Override - Route V04', subject: 'Dispatcher-02', target: 'Vehicle V04', status: 'success', time: '3 hours ago', icon: User },
  { id: 'EVT-9905', type: 'system', action: 'Nightly Database Backup', subject: 'Cron Job', target: 'Main DB', status: 'success', time: '5 hours ago', icon: Database },
  { id: 'EVT-9906', type: 'security', action: 'Failed Login Attempt', subject: 'Unknown IP', target: 'Auth Portal', status: 'warning', time: '12 hours ago', icon: Shield },
];

function Database(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

export default function ActivityLogsPage() {
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const filteredLogs = LOGS.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'security') return log.type === 'security' || log.type === 'auth';
    if (filter === 'system') return log.type === 'system' || log.type === 'data';
    if (filter === 'user') return log.type === 'user';
    return true;
  });

  const handleExport = () => {
    toast({
      title: 'Audit Export Started',
      description: 'The secure CSV log is being prepared for download.',
      type: 'success'
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader title="System Activity Logs" subtitle="Immutable audit trail of all platform operations, AI triggers, and user access events." />

      <div className="bg-card/30 border border-border rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {[
              { id: 'all', label: 'All Logs' },
              { id: 'security', label: 'Security' },
              { id: 'system', label: 'System AI' },
              { id: 'user', label: 'User Actions' },
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap border",
                  filter === f.id 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest px-3 py-1.5 bg-foreground/5 rounded-lg whitespace-nowrap"
          >
            <Globe className="w-3.5 h-3.5" /> Export Audit
          </button>
        </div>

        {/* Console View */}
        <div className="p-6 font-mono text-sm">
          <div className="space-y-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="group flex items-start gap-4 p-2 hover:bg-muted/30 rounded-lg transition-colors border border-transparent hover:border-border">
                <div className="w-24 shrink-0 mt-0.5">
                  <span className="text-muted-foreground text-[10px] sm:text-xs">{log.time}</span>
                </div>
                
                <div className="w-24 shrink-0 mt-0.5">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                    log.status === 'success' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                    log.status === 'warning' ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" :
                    "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}>
                    {log.id}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-wrap items-center gap-3">
                  <log.icon className={cn(
                    "w-4 h-4 shrink-0",
                    log.type === 'security' || log.type === 'auth' ? "text-orange-500 dark:text-orange-400" :
                    log.type === 'system' ? "text-emerald-500 dark:text-emerald-400" :
                    log.type === 'data' ? "text-blue-500 dark:text-blue-400" :
                    "text-muted-foreground"
                  )} />
                  <span className="text-foreground/80 break-words">{log.action}</span>
                  <span className="text-muted-foreground text-xs hidden lg:inline-block">→</span>
                  <span className="text-muted-foreground text-[10px] hidden md:inline-block border border-border px-2 py-0.5 rounded bg-foreground/[0.02]">
                    Subject: {log.subject}
                  </span>
                  <span className="text-muted-foreground text-[10px] hidden md:inline-block border border-border px-2 py-0.5 rounded bg-foreground/[0.02]">
                    Target: {log.target}
                  </span>
                </div>

              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No matching events found</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex items-center justify-center pt-6 border-t border-border opacity-50">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <Terminal className="w-4 h-4" />
              <span>Awaiting new events...</span>
              <span className="w-2 h-4 bg-muted-foreground animate-pulse ml-1" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
