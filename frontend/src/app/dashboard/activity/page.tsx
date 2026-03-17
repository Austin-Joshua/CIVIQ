'use client';

import { Activity, Terminal, Shield, User, Globe, FileCode2, Clock, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Cards';
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
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="System Activity Logs" subtitle="Immutable audit trail of all platform operations, AI triggers, and user access events." />

      <div className="bg-card/30 border border-border rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-card flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-lg whitespace-nowrap">All Logs</button>
            <button className="px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent text-xs font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap">Security</button>
            <button className="px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent text-xs font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap">System AI</button>
            <button className="px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent text-xs font-bold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap">User Actions</button>
          </div>
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest px-3 py-1.5 bg-foreground/5 rounded-lg whitespace-nowrap">
            <Globe className="w-3.5 h-3.5" /> Export Audit
          </button>
        </div>

        {/* Console View */}
        <div className="p-6 font-mono text-sm">
          <div className="space-y-1">
            {LOGS.map((log) => (
              <div key={log.id} className="group flex items-start gap-4 p-2 hover:bg-muted/30 rounded-lg transition-colors border border-transparent hover:border-border">
                <div className="w-24 shrink-0 mt-0.5">
                  <span className="text-muted-foreground text-xs">{log.time}</span>
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

                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <log.icon className={cn(
                    "w-4 h-4 shrink-0",
                    log.type === 'security' ? "text-orange-500 dark:text-orange-400" :
                    log.type === 'system' ? "text-emerald-500 dark:text-emerald-400" :
                    log.type === 'data' ? "text-blue-500 dark:text-blue-400" :
                    "text-muted-foreground"
                  )} />
                  <span className="text-foreground/80">{log.action}</span>
                  <span className="text-muted-foreground text-xs hidden md:inline-block">→</span>
                  <span className="text-muted-foreground text-xs hidden md:inline-block border border-border px-2 py-0.5 rounded bg-foreground/[0.02]">
                    Subject: {log.subject}
                  </span>
                  <span className="text-muted-foreground text-xs hidden md:inline-block border border-border px-2 py-0.5 rounded bg-foreground/[0.02]">
                    Target: {log.target}
                  </span>
                </div>

              </div>
            ))}
          </div>
          
          <div className="mt-8 flex items-center justify-center pt-6 border-t border-border opacity-50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
