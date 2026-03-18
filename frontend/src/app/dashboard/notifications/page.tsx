'use client';

import { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Info, Clock, Trash2, Filter, MoreVertical, Zap, Check, RotateCcw } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Cards';
import { useToast } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Predicted Overflow Event',
    desc: 'Zone C (Industrial) is predicted to reach 95% capacity in 2 hours.',
    type: 'critical',
    category: 'risk',
    time: '4 minutes ago',
    icon: AlertTriangle,
    read: false
  },
  {
    id: 2,
    title: 'Route Optimization Complete',
    desc: 'Vehicle V-09 has been successfully rerouted to avoid traffic in Sector-B.',
    type: 'success',
    category: 'system',
    time: '22 minutes ago',
    icon: CheckCircle2,
    read: false
  },
  {
    id: 3,
    title: 'Fleet Maintenance Alert',
    desc: 'Truck V-14 is scheduled for hydraulic check tomorrow at 08:00.',
    type: 'warning',
    category: 'system',
    time: '1 hour ago',
    icon: Clock,
    read: true
  },
  {
    id: 4,
    title: 'Sustainability Goal Met',
    desc: 'Zone D has surpassed the 50% recycling diversion rate for this month!',
    type: 'info',
    category: 'system',
    time: '3 hours ago',
    icon: Zap,
    read: true
  }
];

export default function NotificationsPage() {
  const { openReport } = useUIStore();
  const [notifs, setNotifs] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, read: true })));
    toast({ title: 'Notifications Updated', description: 'All notifications marked as read.', type: 'success' });
  };

  const toggleRead = (id: number) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const deleteNotif = (id: number) => {
    setNotifs(notifs.filter(n => n.id !== id));
    toast({ title: 'Deleted', description: 'Notification removed.', type: 'info' });
  };

  const filteredNotifs = notifs.filter(n => {
    if (filter === 'all') return true;
    return n.category === filter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader title="Notification Center" subtitle="Stay updated with real-time urban infrastructure alerts and AI performance logs." />
        <button 
          onClick={markAllRead}
          className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-widest self-start md:self-center"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-card/50 border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-card/30 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setFilter('all')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                filter === 'all' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('risk')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                filter === 'risk' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Risk
            </button>
            <button 
              onClick={() => setFilter('system')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all",
                filter === 'system' ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground"
              )}
            >
              System
            </button>
          </div>
          <Filter className="w-4 h-4 text-muted-foreground/50" />
        </div>

        <div className="divide-y divide-border">
          {filteredNotifs.length > 0 ? filteredNotifs.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => openReport('alert', { type: notif.title, severity: notif.type.toUpperCase(), message: notif.desc, time: notif.time })}
              className={cn(
                "p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors group relative cursor-pointer",
                !notif.read && "bg-primary/[0.02]"
              )}
            >
              {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
              
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
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "text-sm font-bold transition-colors",
                      notif.read ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
                    )}>{notif.title}</h3>
                    {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground/50 uppercase whitespace-nowrap">{notif.time}</span>
                </div>
                <p className={cn(
                  "text-xs mt-1 leading-relaxed",
                  notif.read ? "text-muted-foreground/60" : "text-muted-foreground"
                )}>{notif.desc}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button 
                    onClick={() => toggleRead(notif.id)}
                    className="text-[10px] font-bold text-foreground/70 px-2.5 py-1 bg-foreground/5 border border-border rounded hover:bg-muted transition-all flex items-center gap-1.5"
                  >
                    {notif.read ? <RotateCcw className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    {notif.read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button 
                    onClick={() => deleteNotif(notif.id)}
                    className="text-[10px] font-bold text-muted-foreground/50 hover:text-red-500 px-2.5 py-1 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    Dismiss
                  </button>
                </div>
              </div>
              <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground/50" />
              </button>
            </div>
          )) : (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="text-sm font-bold uppercase tracking-widest">No notifications found</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-card/20 text-center border-t border-border">
          <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors">Show Older Notifications</button>
        </div>
      </div>
    </div>
  );
}

