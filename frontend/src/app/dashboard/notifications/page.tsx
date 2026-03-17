'use client';

import { Bell, AlertTriangle, CheckCircle2, Info, Clock, Trash2, Filter, MoreVertical, Zap } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Cards';
import { cn } from '@/lib/utils';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Predicted Overflow Event',
    desc: 'Zone C (Industrial) is predicted to reach 95% capacity in 2 hours.',
    type: 'critical',
    time: '4 minutes ago',
    icon: AlertTriangle
  },
  {
    id: 2,
    title: 'Route Optimization Complete',
    desc: 'Vehicle V-09 has been successfully rerouted to avoid traffic in Sector-B.',
    type: 'success',
    time: '22 minutes ago',
    icon: CheckCircle2
  },
  {
    id: 3,
    title: 'Fleet Maintenance Alert',
    desc: 'Truck V-14 is scheduled for hydraulic check tomorrow at 08:00.',
    type: 'warning',
    time: '1 hour ago',
    icon: Clock
  },
  {
    id: 4,
    title: 'Sustainability Goal Met',
    desc: 'Zone D has surpassed the 50% recycling diversion rate for this month!',
    type: 'info',
    time: '3 hours ago',
    icon: Zap
  }
];

export default function NotificationsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <SectionHeader title="Notification Center" subtitle="Stay updated with real-time urban infrastructure alerts and AI performance logs." />
        <button className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-widest">Mark all as read</button>
      </div>

      <div className="bg-card/50 border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-card/30 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded-md">All</button>
            <button className="px-3 py-1 text-muted-foreground text-[10px] font-bold uppercase hover:text-foreground">Risk</button>
            <button className="px-3 py-1 text-muted-foreground text-[10px] font-bold uppercase hover:text-foreground">System</button>
          </div>
          <Filter className="w-4 h-4 text-muted-foreground/50" />
        </div>

        <div className="divide-y divide-border">
          {NOTIFICATIONS.map((notif) => (
            <div key={notif.id} className="p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors group">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
                notif.type === 'critical' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                notif.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                notif.type === 'warning' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                "bg-blue-500/10 border-blue-500/20 text-blue-500"
              )}>
                <notif.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{notif.title}</h3>
                  <span className="text-[10px] font-medium text-muted-foreground/50 uppercase whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notif.desc}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button className="text-[10px] font-bold text-foreground/70 px-2.5 py-1 bg-foreground/5 border border-border rounded hover:bg-muted transition-all">Actions</button>
                  <button className="text-[10px] font-bold text-muted-foreground/50 hover:text-muted-foreground px-2.5 py-1">Dismiss</button>
                </div>
              </div>
              <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground/50" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-card/20 text-center border-t border-border">
          <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors">Show Older Notifications</button>
        </div>
      </div>
    </div>
  );
}
