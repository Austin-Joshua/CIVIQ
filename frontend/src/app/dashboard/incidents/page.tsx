'use client';

import { useState, useEffect } from 'react';
import { 
  AlertCircle, Clock, UserPlus, CheckCircle, Search, 
  Filter, MoreHorizontal, MapPin, Loader2, ShieldAlert,
  FileDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useWebSocket } from '@/providers/WebSocketProvider';
import { useIsMounted } from '@/hooks/useIsMounted';
import { ExportButton } from '@/components/reports/ExportButton';

interface Incident {
  id: string;
  type: string;
  severity: string;
  status: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  resolutionNotes?: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
}

interface OrgUser {
  id: string;
  name: string;
}

export default function IncidentCommandPage() {
  const isMounted = useIsMounted();
  const { token, user } = useAuthStore();
  const { socket } = useWebSocket();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIncidents = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/incidents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch incidents');
      const data = await res.json();
      setIncidents(data);
    } catch (error) {
      toast.error('Could not load operational incidents');
    }
  };

  const fetchUsers = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users for assignment', error);
    }
  };

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      Promise.all([fetchIncidents(), fetchUsers()]).finally(() => setIsLoading(false));
    }
  }, [token]);

  // Real-time synchronization
  useEffect(() => {
    if (!socket) return;

    socket.on('incident_created', (newIncident: Incident) => {
      setIncidents(prev => [newIncident, ...prev]);
      toast('New Incident Detected', {
        description: newIncident.message,
        icon: <ShieldAlert className="w-4 h-4 text-red-500" />
      });
    });

    socket.on('incident_updated', (updatedIncident: Incident) => {
      setIncidents(prev => prev.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc));
    });

    return () => {
      socket.off('incident_created');
      socket.off('incident_updated');
    };
  }, [socket]);

  const handleUpdate = async (id: string, updates: Partial<Incident>) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/incidents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Incident record updated');
    } catch (error) {
      toast.error('Failed to sync update');
    }
  };

  const filteredIncidents = incidents.filter(inc => 
    inc.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-foreground">Incident Command</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Real-time Enterprise Resolution Lifecycle
          </p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Search incidents..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>
            <button className="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
                <Filter className="w-4 h-4 text-muted-foreground" />
            </button>
            <ExportButton data={filteredIncidents} filename="civiq_incidents" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
            <div className="p-6 bg-card/50 border border-border rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <AlertCircle className="w-20 h-20 text-red-500" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Active Alerts</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-foreground">{incidents.filter(i => !i.resolved).length}</span>
                </div>
            </div>
            <div className="p-6 bg-card/50 border border-border rounded-[2rem]">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Resolved (24h)</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-foreground">{incidents.filter(i => i.resolved).length}</span>
                </div>
            </div>
        </div>

        <div className="lg:col-span-3">
            <div className="bg-card/50 border border-border rounded-[2rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type & Description</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Severity</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assignee</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Accessing Fleet Intelligence...</p>
                                    </td>
                                </tr>
                            ) : filteredIncidents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">
                                        No active records found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredIncidents.map((inc) => (
                                    <tr key={inc.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-black text-foreground">{inc.id.slice(0, 8)}</span>
                                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                                {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 max-w-[200px]">
                                            <h4 className="text-sm font-black text-foreground leading-tight">{inc.type.replace('_', ' ')}</h4>
                                            <p className="text-[10px] text-muted-foreground font-medium line-clamp-1 mt-0.5">{inc.message}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={cn(
                                                "inline-flex items-center px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                inc.severity === 'CRITICAL' ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
                                                inc.severity === 'HIGH' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                                "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                            )}>
                                                {inc.severity}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <select 
                                                value={inc.assignedToId || ''} 
                                                onChange={(e) => handleUpdate(inc.id, { assignedToId: e.target.value })}
                                                className="bg-transparent text-[11px] font-bold text-foreground border-none outline-none focus:ring-0 cursor-pointer"
                                            >
                                                <option value="" className="bg-card">Unassigned</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id} className="bg-card">{u.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-5">
                                            <select 
                                                value={inc.status} 
                                                onChange={(e) => handleUpdate(inc.id, { status: e.target.value })}
                                                className={cn(
                                                    "bg-background border border-border rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/40",
                                                    inc.status === 'RESOLVED' ? "text-emerald-500 border-emerald-500/20" : 
                                                    inc.status === 'DETECTED' ? "text-muted-foreground" : "text-primary"
                                                )}
                                            >
                                                <option value="DETECTED">Detected</option>
                                                <option value="ASSIGNED">Assigned</option>
                                                <option value="RESPONDING">Responding</option>
                                                <option value="RESOLVED">Resolved</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
